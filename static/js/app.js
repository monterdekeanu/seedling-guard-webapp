$(document).ready(function () {
  // DHT11 Chart for Humidity and Temperature
  const ctxDHT11 = document.getElementById("DHT11Chart").getContext("2d");
  const txtTemperature = document.getElementById("txtTemperature");
  const txtWaterSalinity = document.getElementById("txtWaterSalinity");
  const txtWaterSalinityMotor = document.getElementById("txtWaterSalinityMotor");
  const txtSoilMoisture = document.getElementById("txtSoilMoisture");
  const txtSoilMoistureMotor = document.getElementById("txtSoilMoistureMotor");
  const txtDHT11Status = document.getElementById("txtDHT11Status");
  const txtTDSStatus = document.getElementById("txtTDSStatus");
  const txtWaterMotor = document.getElementById("txtWaterMotor");
  const txtFertilizerMotor = document.getElementById("txtFertilizerMotor");
  const txtBlindMotor = document.getElementById("txtBlindMotor");
  const txtSoilMoistureStatus = document.getElementById("txtSoilMoistureStatus");
  const txtOverallStatus = document.getElementById("txtOverallStatus");
  const txtOverallDescription = document.getElementById("txtOverallDescription");
  let soilStatus = 0;
  let tempStatus = 0;
  let salinityStatus = 0;
  const DHT11Chart = new Chart(ctxDHT11, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature",
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          data: [],
          fill: false,
        },
      ],
    },
    options: {
      animation: {
        duration: 1000,
        easing: 'linear',
      }
    }
  });

  // TDS Meter Chart for Water Salinity
  const ctxTDSMeter = document.getElementById("TDSMeterChart").getContext("2d");
  const TDSMeterChart = new Chart(ctxTDSMeter, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Water Salinity",
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        data: [],
        fill: false,
      }],
    },
    options: {
      animation: {
        duration: 1000,
        easing: 'linear',
      }
    }
  });

  // Soil Moisture Chart
  const ctxSoilMoisture = document.getElementById("SoilMoistureChart").getContext("2d");
  const SoilMoistureChart = new Chart(ctxSoilMoisture, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Soil Moisture",
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        data: [],
        fill: false,
      }],
    },
    options: {
      animation: {
        duration: 1000,
        easing: 'linear',
      }
    }
  });

  function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset, index) => {
      dataset.data.push(data[index]);
    });
    chart.update();
  }

  function removeFirstData(chart) {
    chart.data.labels.splice(0, 1);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });
  }

  const MAX_DATA_COUNT = 10;
  const socket = io.connect();
  
  var soilCounter = 0;
  
  socket.on("updateTimer", function(msg){
    
    soilCounter = 30 - msg.values.counter;
    
    })

  socket.on("updateSensorData", function (msg) {
    console.log("Received sensorData :: " + msg.date + " :: " + msg.values);

    if (DHT11Chart.data.labels.length > MAX_DATA_COUNT) {
      removeFirstData(DHT11Chart);
    }
    if (TDSMeterChart.data.labels.length > MAX_DATA_COUNT) {
      removeFirstData(TDSMeterChart);
    }
    if (SoilMoistureChart.data.labels.length > MAX_DATA_COUNT) {
      removeFirstData(SoilMoistureChart);
    }

    addData(DHT11Chart, msg.date, [ msg.values.temperature]);
    if(msg.values.temperature == 0){
      tempStatus = -1;
      txtDHT11Status.innerText = "Sensor not found"
      txtDHT11Status.style.color = "red";
    }else if(msg.values.temperature > 30){
      txtDHT11Status.innerText = "Critical"
      tempStatus = 3;
      txtDHT11Status.style.color = "red";
      txtBlindMotor.innerText = "Blinds: Close";
    }else if(msg.values.temperature <20){
      txtDHT11Status.innerText = "Cooling"
      tempStatus = 1;
      txtDHT11Status.style.color = "blue";
      txtBlindMotor.innerText = "Blinds: Open";
    }else{
      tempStatus = 2;
      txtDHT11Status.innerText = "Normal"
      txtDHT11Status.style.color = "green";
      txtBlindMotor.innerText = "Blinds: Open";
    }
    if(msg.values.salinity < 300){
        salinityStatus = 1;
        txtTDSStatus.innerText = "Low Salinity";
        txtTDSStatus.style.color = "red";
        txtWaterSalinityMotor.innerText = "Pumping Fertilizer in " + soilCounter + " s";
        if(soilCounter <= 0){
            txtWaterSalinityMotor.innerText = "Pumping Fertilizer Now...";
            txtFertilizerMotor.innerText = "Fertilizer Motor: Enabled";
            txtFertilizerMotor.style.color = "green";
          }else{
            txtFertilizerMotor.innerText = "Fertilizer Motor: Disabled";
            txtFertilizerMotor.style.color = "grey";
          }
        
        txtWaterSalinityMotor.style.color = "green";
    }else if(msg.values.salinity >= 300 && msg.values.salinity <= 800){
        salinityStatus = 2;
        txtTDSStatus.innerText = "Moderate Salinity";
        txtWaterSalinityMotor.style.color = "black";
        txtTDSStatus.style.color = "green";
        txtWaterSalinityMotor.innerText = " ";
    }else{
        salinityStatus = 3;
        txtTDSStatus.innerText = "High Salinity";
        txtTDSStatus.style.color = "red";
        //txtWaterSalinityMotor.innerText = "Pumping Water in " + soilCounter + " s";
        txtWaterSalinityMotor.innerText = " ";
        //if(soilCounter <= 0){
        //    txtWaterSalinityMotor.innerText = "Pumping water Now...";
        //    txtWaterMotor.innerText = "Water Pump: Enabled";
        //  }else {
        //    txtWaterMotor.innerText = "Water Pump: Disabled";
        //    }
        //txtWaterSalinityMotor.style.color = "blue";
    }
    if(msg.values.moisture < 5){
        soilStatus = 1;
        txtSoilMoistureStatus.innerText = "Dry";
        txtSoilMoistureStatus.style.color = "red";
        txtSoilMoistureMotor.innerText = "Dispensing Water";
        txtWaterMotor.innerText = "Water Pump: Enabled";
        txtWaterMotor.style.color = "blue";
        txtSoilMoistureMotor.style.color = "blue";
        
    }else if(msg.values.salinity >= 5 && msg.values.salinity <= 5.7){
        soilStatus = 2;
        txtSoilMoistureStatus.innerText = "Moist";
        txtSoilMoistureStatus.style.color = "green";
        txtSoilMoistureMotor.innerText = " ";
        txtWaterMotor.innerText = "Water Pump: Disabled";
        txtWaterMotor.style.color = "grey";
        txtSoilMoistureMotor.style.color = "grey";
    }else{
        soilStatus = 3;
        txtSoilMoistureStatus.innerText = "Wet";
        txtSoilMoistureStatus.style.color = "green";
        txtSoilMoistureMotor.innerText = " ";
        txtWaterMotor.innerText = "Water Pump: Disabled";
        txtWaterMotor.style.color = "grey";
        txtSoilMoistureMotor.style.color = "grey";
    }
    txtTemperature.innerText = msg.values.temperature + " °C";
    addData(TDSMeterChart, msg.date, [msg.values.salinity]);
    txtWaterSalinity.innerText = msg.values.salinity + " ppm";
    addData(SoilMoistureChart, msg.date, [msg.values.moisture]);
    txtSoilMoisture.innerText = msg.values.moisture + "mL";
    var overallStatus = soilStatus + salinityStatus + tempStatus;
    if(overallStatus <= 4){
      txtOverallStatus.innerText = "Suboptimal";
      txtOverallDescription.innerText = "Seedlings categorized as Suboptimal are experiencing conditions less conducive to optimal growth, including extremes in temperature, inadequate soil moisture, or high levels of soil salinity. While they may still survive and grow to some extent, their overall";
    }else if(overallStatus == 5){
      txtOverallStatus.innerText = "Normal";
      txtOverallDescription.innerText = "Seedlings classified as Normal are in good condition, displaying satisfactory growth and development, and seedlings growing under ideal conditions in one or more environmental factors, such as normal temperature, moist soil, and moderate salinity.";
      }else{
        txtOverallStatus.innerText = "Optimal";
        txtOverallDescription.innerText = "In the Optimal category, seedlings thrive under low conditions, which require moderate temperatures, adequate soil moisture, and low to moderate soil salinity.";
        }
  });
});
