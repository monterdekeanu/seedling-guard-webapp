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
  const txtSoilMoistureStatus = document.getElementById("txtSoilMoistureStatus");
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
    if(msg.values.temperature > 30){
      txtDHT11Status.innerText = "Close Blinds"
      txtDHT11Status.style.color = "red";
    }else{
      txtDHT11Status.innerText = "Open Blinds"
      txtDHT11Status.style.color = "green";
    }
    if(msg.values.salinity < 300){
        txtTDSStatus.innerText = "Low Salinity";
        txtTDSStatus.style.color = "red";
        txtWaterSalinityMotor.innerText = "Pumping Fertilizer in " + soilCounter + " s";
        if(soilCounter <= 0){
            txtWaterSalinityMotor.innerText = "Pumping Fertilizer Now...";
          }
        
        txtWaterSalinityMotor.style.color = "green";
    }else if(msg.values.salinity >= 300 && msg.values.salinity <= 800){
        txtTDSStatus.innerText = "Moderate Salinity";
        txtWaterSalinityMotor.style.color = "black";
        txtTDSStatus.style.color = "green";
    }else{
        txtTDSStatus.innerText = "High Salinity";
        txtTDSStatus.style.color = "red";
        txtWaterSalinityMotor.innerText = "Pumping Water in " + soilCounter + " s";
        if(soilCounter <= 0){
            txtWaterSalinityMotor.innerText = "Pumping Water Now...";
          }
        txtWaterSalinityMotor.style.color = "blue";
    }
    if(msg.values.moisture < 5){
        txtSoilMoistureStatus.innerText = "Dry";
        txtSoilMoistureStatus.style.color = "red";
        txtSoilMoistureMotor.innerText = "Water Pump: Enabled";
    }else if(msg.values.salinity >= 5 && msg.values.salinity <= 5.7){
        txtSoilMoistureStatus.innerText = "Moist";
        txtSoilMoistureStatus.style.color = "green";
        txtSoilMoistureMotor.innerText = "Water Pump: Disabled";
    }else{
        txtSoilMoistureStatus.innerText = "Wet";
        txtSoilMoistureStatus.style.color = "green";
        txtSoilMoistureMotor.innerText = "Water Pump: Disabled";
    }
    txtTemperature.innerText = msg.values.temperature + " °C";
    addData(TDSMeterChart, msg.date, [msg.values.salinity]);
    txtWaterSalinity.innerText = msg.values.salinity + " ppm";
    addData(SoilMoistureChart, msg.date, [msg.values.moisture]);
    txtSoilMoisture.innerText = msg.values.moisture + "mL";
  });
});
