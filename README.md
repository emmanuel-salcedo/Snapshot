# ITOptics - SnapShot

## Overview

SnapShot is a web application that displays various Key Performance Indicators (KPIs) related to network device statistics. The application is divided into a backend and a frontend, where the backend is responsible for data retrieval and API services, and the frontend is dedicated to presenting the data in a user-friendly manner.

## AirControl Requirement

The tool requires there be an existing Ubiquiti airControl v2.1 server on your network. The API calls use the airControl REST API v1. An API user and password will be used to make the calls. Login credentials need to placed in the kpi_script.py file

## How It Works

- The **Backend** is built with Flask and provides a RESTful API. It collects KPI data from databases or external sources and serves it to the frontend.
- The **Frontend** is a static site that uses HTML, CSS, and JavaScript to render the KPI data. It fetches data from the backend through API calls and updates the UI dynamically.

## Project Structure

```
/CSUMB-CAPSTONE-V2
│
├── README.md                       - Documentation for the project.
│
├── /frontend
│   ├── /css
│   │   ├── style.css               - The compiled CSS stylesheet applied to the frontend.
│   │   ├── style.css.map           - Provides a mapping between SCSS and CSS files for development tools.
│   │   └── style.scss              - SCSS file with variables and mixins for styling, compiles to CSS.
│   ├── /images
│   │   ├── Snapshot Logo.png       - A logo or image in PNG format.
│   │   ├── itopticslogo.svg        - A vector graphics logo for "itoptics".
│   │   ├── Asset 3.svg             - A scalable vector graphics file for icons or illustrations.
│   │   ├── Asset 2.svg             - Another vector graphic asset.
│   │   └── Asset 1.svg             - Additional vector graphic asset.
│   ├── /js
│   │   ├── splash.js               - A JavaScript file for splash screen effects or initial loading interactions.
│   │   ├── dashboard.js            - Contains the logic for the dashboard's interactivity.
│   │   ├── chartjs-plugin-annotation@1.0.2 - A JavaScript plugin for adding annotations to charts.
│   │   ├── chart.umd.js.map        - Source map for the UMD build of Chart.js, aiding in debugging.
│   │   └── chart.js                - A JavaScript library for creating interactive charts.
│   └── index.html                  - The main HTML file for the frontend, structuring the dashboard's layout.
│   └── clientInfo.html             - An HTML file containing specific information for clients.
│
└── /backend
    ├── /venv                       - A directory containing the virtual environment for Python dependencies.
    ├── utils.py                    - Utility functions for use across the backend.
    ├── server.py                   - The backend server script, likely written in Flask for serving APIs.
    ├── requirements.txt            - A list of Python package dependencies for the project.
    ├── kpi_script.py               - A script for calculating and managing key performance indicators.
    └── __pycache__                 - Python's cache directory where compiled bytecode is stored.

```

## Setup Instructions

### Backend

1. Navigate to the `backend` directory.
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```
   python server.py
   ```
   The server will run on `http://localhost:8080`.

### Frontend

1. Navigate to the `frontend/` directory.
2. Open the `index.html` file in a web browser to access the dashboard.

### Customization

- **CSS**: Modify `/frontend/css/styles.css` to alter the visual design.
- **JavaScript**: Change `/frontend/js/dashboard.js` to adjust the dashboard functionality or to add new features.
- **HTML**: Edit `/frontend/index.html` to customize the layout.

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **API**: RESTful services provided by the Flask backend

## Features

- **Live Data**: The dashboard displays live KPI data, refreshing at predefined intervals.
- **User Interaction**: Users can trigger data updates manually if needed.

## Usage

To use this application, navigate to the dashboard page on your web browser. If the backend server is running, the dashboard should display the latest KPIs. Use the refresh button or wait for the automatic refresh for the latest updates.

## Documentation

- **Backend API**: The Flask server hosts RESTful API endpoints. For detailed documentation on these endpoints, refer to `server.py`.
- **Frontend Components**: The frontend is structured into modular components for easy maintenance. Refer to the comments in `index.html`, `style.css`, and `dashboard.js` for more details.
- **Data Flow and Processing**: Data flows

 from external APIs or databases to the Flask backend, which processes and sends it to the frontend for display. For processing details, see `kpi_script.py` and `utils.py`.