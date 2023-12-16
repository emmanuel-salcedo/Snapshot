from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS
from kpi_script import get_kpis
from utils import validate_mac_address

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/kpi/<mac_address>', methods=['GET'])
def run_kpi_script(mac_address):
    # Validate the MAC address format
    if not validate_mac_address(mac_address):
        return "Invalid MAC address format", 400

    try:
        # Assuming get_kpis is a function that takes a mac_address and returns the KPIs
        kpi_data = get_kpis(mac_address)
        return jsonify(kpi_data), 200
    except Exception as e:
        # Log the error for server-side troubleshooting
        app.logger.error(f"Error retrieving KPIs for {mac_address}: {e}")
        return str(e), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
