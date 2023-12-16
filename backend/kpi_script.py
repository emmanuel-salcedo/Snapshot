import requests
from requests.exceptions import HTTPError

# Utility functions for formatting data (these need to be defined in your utils module)
from utils import format_uptime, format_ethernet_status

# Disable SSL warnings (not recommended for production use)
requests.packages.urllib3.disable_warnings()

# airControl Server IP and API credentials need to be entered here
# Uncomment variables when data is entered
def get_kpis(mac_address):
    # Define the API login URL and credentials
    login_url = # "https://airControlServerIP:9082/api/v1/login"
    login_payload = {
        "username": #"API User Here",
        "password": #"API User Password",
        "eulaAccepted": True,
        "verifyCsrfToken": True
    }
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    # Create a session to persist cookies and headers across requests
    session = requests.Session()

    try:
        # Login to the API and retrieve CSRF token
        login_response = session.post(login_url, headers=headers, json=login_payload, verify=False)
        login_response.raise_for_status()

        # Extract CSRF token and update session headers
        csrf_token = login_response.json().get('csrfToken')
        session.headers.update({'X-CSRF-TOKEN': csrf_token})

        # Fetch device KPIs using the provided MAC address
        device_url = f#"https://airControlServerIP:9082/api/v1/devices/mac/{mac_address}"
        device_response = session.get(device_url, headers=session.headers, verify=False)
        device_response.raise_for_status()

        # Extract device data from response
        device_data = device_response.json()
        properties = device_data.get('properties', {})

        # Format and return the KPI data
        kpis = {
            "Wireless Uptime": f"{properties.get('wlanUpTime@ath0', 0)} seconds ({format_uptime(properties.get('wlanUpTime@ath0', 0))})",
            "System Uptime": f"{properties.get('uptime', 0)} seconds ({format_uptime(properties.get('uptime', 0))})",
            "Signal": f"{properties.get('signal@ath0~current', 0)} dBm",
            "Rx Rate": f"{properties.get('downlinkCap@ath0~current', 0) / 1e6} Mbps",
            "Tx Rate": f"{properties.get('uplinkCap@ath0~current', 0) / 1e6} Mbps",
            "Tx Throughput": f"{properties.get('txTroughput@ath0~current', 0) / 1024000:.3f} Mbps",
            "Rx Throughput": f"{properties.get('rxTroughput@ath0~current', 0) / 1024000:.3f} Mbps",
            "Ethernet Status": format_ethernet_status(properties.get('ifStatus@eth0', 0)),
            "WLAN Latency": f"{properties.get('wlanLatency@ath0~current', 0) / 1000:.2f} ms",
            "Product": properties.get("product", "N/A"),
            "Frequency": f"{properties.get('freq@ath0', 0)} MHz",
            "Frequency Range": properties.get("frequencyRange@ath0", "N/A"),
            "LAN Speed": format_lan_speed(properties.get("lanSpeed", 1))
        }

        return kpis

    except HTTPError as http_err:
        # Handle specific HTTP errors
        raise http_err
    except Exception as err:
        # Handle other exceptions
        raise err

def format_lan_speed(speed_code):
    # Map LAN speed codes to their corresponding descriptions
    lan_speed_map = {
        1: "Undefined/Unplugged",
        18: "10Mbps-Half",
        34: "10Mbps-Full",
        20: "100Mbps-Half",
        36: "100Mbps-Full",
        24: "1000Mbps-Half",
        40: "1000Mbps-Full"
    }
    return lan_speed_map.get(speed_code, "Unknown")

# Example usage
if __name__ == "__main__":
    mac_address = "00:11:22:33:44:55"  # Replace with actual MAC address
    try:
        kpis = get_kpis(mac_address)
        print(kpis)
    except Exception as e:
        print(f"Error fetching KPIs: {e}")