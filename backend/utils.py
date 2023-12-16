def format_uptime(seconds):
    days = seconds // (24 * 3600)
    hours = (seconds % (24 * 3600)) // 3600
    minutes = (seconds % 3600) // 60
    return f"{days}d {hours}h {minutes}m"

def format_ethernet_status(status):
    return "Up" if status == 1 else "Down"

def validate_mac_address(mac_address):
    import re
    # Regex to check a valid MAC address
    mac_regex = re.compile(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$')
    return mac_regex.match(mac_address) is not None