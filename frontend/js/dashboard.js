// Function to extract query parameters from the URL
function getQueryParam(param) {
  var searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

// Define update interval (in milliseconds)
const updateInterval = 5000; // 5 seconds

var searchURLParams = new URLSearchParams(window.location.search);
const maxYdownload = searchURLParams.get('DL')/1024;
const maxYupload = searchURLParams.get('UP')/1024;
// Function to fetch KPI data from the server API using the MAC address
function fetchKPIData() {
  const macAddressInput = document.getElementById('mac-address');
  // Sanitize the MAC address by replacing semicolons with colons
  let sanitizedMacAddress = macAddressInput.value.trim().replace(/-/g, ':');
  macAddressInput.value = sanitizedMacAddress; // Update the input with the sanitized value

  // Validate the MAC address
  if (!isValidMACAddress(sanitizedMacAddress)) {
    alert("Please enter a valid MAC address.");
    return;
  }

  // Fetch data using the sanitized MAC address
  fetch(`http://localhost:8080/kpi/${sanitizedMacAddress}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
	console.log(data);
    updateKPIDisplay(data);
    updateLastUpdatedTimestamp(true); // Indicate success
  })
  .catch(error => {
    console.error('Fetch error: ' + error.message);
    updateLastUpdatedTimestamp(false); // Indicate error
  });
}

// Function to validate the MAC address format
function isValidMACAddress(mac) {
  const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return regex.test(mac);
}

// Function to update the index.html targeted values for KPIs.
// Example Data:
  // "Ethernet Status": "Up",
  // "Rx Rate": "20.0 Mbps",
  // "Rx Throughput": "729.168 Mbps",
  // "Signal": "-56 dBm",
  // "System Uptime": "368565 seconds (4d 6h 22m)",
  // "Tx Rate": "39.0 Mbps",
  // "Tx Throughput": "12602.694 Mbps",
  // "Wireless Uptime": "368514 seconds (4d 6h 21m)"
// 
function updateKPIDisplay(kpis) {

  // Loop through all keys in the kpis object
  Object.keys(kpis).forEach((key) => {
    let elementId;
    let value;
    let updateFunction;

    // Start of switch statement
    switch (key) {
	  case 'Signal':
		elementId = 'signal-strength';
		value = parseFloat(kpis[key].replace(' dBm', ''));
		colorCodeElement(elementId, value); // Directly pass the value to colorCodeElement
		break;
      case 'Ethernet Status': // 
        updateFunction = function(value) {
          const ethernetStatusImage = document.getElementById('ethernet-status-image');
          if (ethernetStatusImage) {
            if (value === 'Up') {
              ethernetStatusImage.src = 'images/Asset 1.svg';
            } else if (value === 'Down') {
              ethernetStatusImage.src = 'images/Asset 2.svg';
            } else {
              ethernetStatusImage.src = 'images/Asset 3.svg';
            }
          }
        };
        break;
      case 'Rx Throughput':
        elementId = 'rx-throughput';
        break;
      case 'Tx Throughput': 
        elementId = 'tx-throughput';
        break;
      case 'System Uptime': 
        elementId = 'system-uptime';
        break;
      case 'Rx Rate':
        elementId = 'rx-rate'; 
        value = parseFloat(kpis[key].replace(' Mbps', ''));
        colorCodeElement(elementId, value, [100, 65], [Infinity, 64]);
        break;
      case 'Tx Rate':
        elementId = 'tx-rate'; 
        value = parseFloat(kpis[key].replace(' Mbps', ''));
        colorCodeElement(elementId, value, [100, 65], [Infinity, 64]);
        break;
      case 'Wireless Uptime': 
        elementId = 'wireless-uptime';
        break;
	  case 'Product': 
        elementId = 'product';
        break;
	  case 'WLAN Latency': 
        elementId = 'wlan';
        break;
	  case 'LAN Speed':
		elementId = 'lan';
		value = parseFloat(kpis[key].replace('Mbps-Full', ''));
        colorCodeElement(elementId, value, [100, 65], [Infinity, 64]);
		break;
	  case 'Frequency': 
		elementId = 'frequency';
        const frequencyValue = parseFloat(kpis[key]);
        document.getElementById(elementId).innerText = frequencyValue + ' MHz';
        // Calculate and display the WLAN channel
        const channel = getWLANChannel(frequencyValue);
        if (channel !== null) {
			document.getElementById('channel').innerText = 'Channel ' + channel;
        } else {
			document.getElementById('channel').innerText = 'N/A';
        }
        break;
	  case 'Frequency Range': 
        elementId = 'frequency-range';
        break;

      // ... add cases for other KPIs if necessary
      default:
        elementId = null; // No corresponding element for this KPI
    } // End of switch statement
	
	
     // Update the corresponding element if it exists
        if (elementId && document.getElementById(elementId) && key !== 'Frequency') {
            document.getElementById(elementId).innerText = kpis[key];
        } else if (updateFunction) {
            updateFunction(kpis[key]);
        }
    });
    hideSplashScreen();
}

// Chart-related variables
let throughputChart;
const maxDataPoints = 5; // Maximum number of data points to display on the chart

// Function to initialize the chart with empty data
function initializeChart() {
  const ctx = document.getElementById('throughputGraph').getContext('2d');
  throughputChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'RX Throughput (Mbps)',
          data: [],
          borderColor: '#FFB0C1',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
        {
          label: 'TX Throughput (Mbps)',
          data: [],
          borderColor: '#9AD0F5',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          tension: 0.1,
        },
      ],
    },
    options: {
	  responsive: true, // Make sure the chart is responsive
      maintainAspectRatio: false, 
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Throughput (Mbps)',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
		annotation: {
		  annotations: [
			{
			  type: 'line',
			  mode: 'horizontal',
			  scaleID: 'y',
			  value: maxYdownload, // the value of your limit
			  borderColor: '#FF6384',
			  borderWidth: 2,
			  label: {
				enabled: true,
				content: 'DL Limit',
			  }
			},
			{
			  type: 'line',
			  mode: 'horizontal',
			  scaleID: 'y',
			  value: maxYupload, // the value of your limit
			  borderColor: '#36A2EB',
			  borderWidth: 2,
			  label: {
				enabled: true,
				content: 'UL Limit',
			  },
			},
		  ]
		},
      },
    },
  });
}

// Function to update the chart with new data
function updateChart(rxData, txData, timestamp) {
  if (throughputChart) {
    // Extract only numbers from the received data
    const rxThroughput = parseFloat(rxData.match(/[\d.]+/)[0]);
    const txThroughput = parseFloat(txData.match(/[\d.]+/)[0]);

    // Add the timestamp to the labels
    throughputChart.data.labels.push(timestamp);

    // Add data points to the chart datasets
    throughputChart.data.datasets[0].data.push(rxThroughput);
    throughputChart.data.datasets[1].data.push(txThroughput);

    // Remove the oldest data point if the maximum data points limit is reached
    if (throughputChart.data.labels.length > maxDataPoints) {
      throughputChart.data.labels.shift();
      throughputChart.data.datasets[0].data.shift();
      throughputChart.data.datasets[1].data.shift();
    }
	
	
    // Update the chart
    throughputChart.update();
  }
}

// Function to update the chart with new data
function updateChartData(rxData, txData) {
  if (throughputChart) {
    // Extract only numbers from the received data
    const rxThroughput = parseFloat(rxData.match(/[\d.]+/)[0]);
    const txThroughput = parseFloat(txData.match(/[\d.]+/)[0]);

    // Get the current timestamp
    const currentTime = new Date().toLocaleTimeString();

    // Add new data points
    throughputChart.data.labels.push(currentTime);
    throughputChart.data.datasets[0].data.push(rxThroughput);
    throughputChart.data.datasets[1].data.push(txThroughput);

    // Check if the total number of data points exceeds 20
    if (throughputChart.data.labels.length > 20) {
      // Remove the oldest data point
      throughputChart.data.labels.shift();
      throughputChart.data.datasets[0].data.shift();
      throughputChart.data.datasets[1].data.shift();
    }

    // Update the chart
    throughputChart.update();

    // Log the data with timestamp
    console.log(
      `Data updated at ${currentTime}: RX: ${rxThroughput} Mbps, TX: ${txThroughput} Mbps`
    );
  }
}


// Function to fetch KPI data from the server API and update the chart
function fetchAndUpdateData() {
  const macAddressInput = document.getElementById('mac-address');
  const sanitizedMacAddress = macAddressInput.value.trim().replace(/-/g, ':');

  fetch(`http://localhost:8080/kpi/${sanitizedMacAddress}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      updateKPIDisplay(data);
      updateChartData(data['Rx Throughput'], data['Tx Throughput']);
      updateLastUpdatedTimestamp(true);

      // Log the message with updated data to the console
      console.log('Data updated at:', new Date().toLocaleString(), 'KPIs:', data);
    })
    .catch((error) => {
      console.error('Fetch error: ' + error.message);
      updateLastUpdatedTimestamp(false);
    });
}

function colorCodeElement(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.fontWeight = 'bold'; // Make text bold
    element.style.fontSize = '1.2em'; // Increase font size

	if (elementId == 'signal-strength') {
		if (value >= -63) {
		  element.style.color = 'green';
		  element.style.backgroundColor = '#e0ffe0'; // Light green background
		} else if (value >= -69) {
		  element.style.color = 'orange';
		  element.style.backgroundColor = '#fff0e0'; // Light orange background
		} else {
		  element.style.color = 'red';
		  element.style.backgroundColor = '#ffe0e0'; // Light red background
		  element.classList.add('flash'); // Add flashing animation class
		}
	}
	if (elementId == 'tx-rate' || elementId == 'rx-rate') {
		if (value >= 90) {
		  element.style.color = 'green';
		  element.style.backgroundColor = '#e0ffe0'; // Light green background
		} else if (value >= 70) {
		  element.style.color = 'orange';
		  element.style.backgroundColor = '#fff0e0'; // Light orange background
		} else {
		  element.style.color = 'red';
		  element.style.backgroundColor = '#ffe0e0'; // Light red background
		  element.classList.add('flash'); // Add flashing animation class
		}
	}
	if (elementId == 'lan') {
		if (value == 1000) {
		  element.style.color = 'green';
		  element.style.backgroundColor = '#e0ffe0'; // Light green background
		} else if (value >= 100) {
		  element.style.color = 'orange';
		  element.style.backgroundColor = '#fff0e0'; // Light orange background
		} else {
		  element.style.color = 'red';
		  element.style.backgroundColor = '#ffe0e0'; // Light red background
		  element.classList.add('flash'); // Add flashing animation class
		}
	}
}}

// Initialize the chart
initializeChart();

// Function to update the last updated timestamp in the footer
function updateLastUpdatedTimestamp(success) {
  const lastUpdatedParagraph = document.getElementById('last-updated');
  if (success) {
    const currentDate = new Date();
    lastUpdatedParagraph.textContent = `Last Updated: ${currentDate.toLocaleString()}`;
    lastUpdatedParagraph.style.visibility = 'visible'; // Make the last updated timestamp visible
  } else {
    lastUpdatedParagraph.style.visibility = 'hidden'; // Hide the last updated timestamp on error
  }
}

// Function to calculate the WLAN channel based on the given frequency.
function getWLANChannel(frequency) {
    // For 2.4 GHz Band
    if (frequency >= 2401 && frequency <= 2495) {
        if (frequency === 2484) {
            return 14; // Special case for Channel 14
        }
        return Math.ceil((frequency - 2407) / 5);
    }
    // For 5 GHz Band
    else if (frequency >= 5150 && frequency <= 5875) {
        return ((frequency - 5000) / 5);
    }
    // Frequency not in standard WLAN 2.4 GHz or 5 GHz bands
    return null;
}

// Event listener for the update button
document.getElementById('update-button').addEventListener('click', () => {
 // Set an interval to auto-update KPI data every specified interval
  dataUpdateInterval = setInterval(fetchAndUpdateData, updateInterval);
  console.log('Data updates have restarted.');
});

// Event listener for the stop updating button
document.getElementById('stop-update-button').addEventListener('click', () => {
  clearInterval(dataUpdateInterval); // Stop the data update interval
  console.log('Data updates stopped.');
});

document.addEventListener('DOMContentLoaded', () => {
  const lastUpdatedParagraph = document.getElementById('last-updated');
  lastUpdatedParagraph.style.visibility = 'hidden'; // Ensure it's hidden on load

  const macAddressFromURL = getQueryParam('mac');
  if (macAddressFromURL && isValidMACAddress(macAddressFromURL)) {
    document.getElementById('mac-address').value = macAddressFromURL;
    fetchKPIData(); // Fetch data on load if MAC address is present in URL
  }

  // Set an interval to auto-update KPI data every specified interval
  dataUpdateInterval = setInterval(fetchAndUpdateData, updateInterval);
});

function hideSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        splashScreen.style.transition = 'opacity 1s ease-out';
        splashScreen.style.opacity = 0;

        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 1000); // Duration of the fade-out effect
    }
}