$(document).ready(function () {
    // DHT11 Chart for Humidity and Temperature
    const txtAverageWaterSalinity = document.getElementById("txtAverageWaterSalinity");
    const txtAverageSoilMoisture = document.getElementById("txtAverageSoilMoisture");
    const txtTemperature = document.getElementById("txtTemperature");
    const txtTemperature2 = document.getElementById("txtTemperature2");
    const txtWaterSalinity = document.getElementById("txtWaterSalinity");
    const txtWaterSalinity2 = document.getElementById("txtWaterSalinity2");
    const txtWaterSalinityMotor = document.getElementById("txtWaterSalinityMotor");
    const txtSoilMoisture = document.getElementById("txtSoilMoisture");
    const txtSoilMoisture2 = document.getElementById("txtSoilMoisture2");
    const txtSoilMoistureMotor = document.getElementById("txtSoilMoistureMotor");
    const txtDHT11Status = document.getElementById("txtDHT11Status");
    const txtDHT11Status2 = document.getElementById("txtDHT11Status2");
    const txtTDSStatus = document.getElementById("txtTDSStatus");
    const txtTDSStatus2 = document.getElementById("txtTDSStatus2");
    const txtWaterMotor = document.getElementById("txtWaterMotor");
    const txtFertilizerMotor = document.getElementById("txtFertilizerMotor");
    const txtBlindMotor = document.getElementById("txtBlindMotor");
    const txtBlindMotor2 = document.getElementById("txtBlindMotor2");
    const txtSoilMoistureStatus = document.getElementById("txtSoilMoistureStatus");
    const txtSoilMoistureStatus2 = document.getElementById("txtSoilMoistureStatus2");
    const txtOverallStatus = document.getElementById("txtOverallStatus");
    const txtOverallDescription = document.getElementById("txtOverallDescription");
    const txtOverallStatus2 = document.getElementById("txtOverallStatus2");
    const txtOverallDescription2 = document.getElementById("txtOverallDescription2");
    let soilStatus = 0;
    let tempStatus = 0;
    let salinityStatus = 0;
    let soilStatus2 = 0;
    let tempStatus2 = 0;
    let salinityStatus2 = 0;
    const ctxDHT11 = document.getElementById("DHT11Chart").getContext("2d");
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

    const ctxDHT112 = document.getElementById("DHT11Chart2").getContext("2d");
    const DHT11Chart2 = new Chart(ctxDHT112, {
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
    const ctxTDSMeter2 = document.getElementById("TDSMeterChart2").getContext("2d");
    const TDSMeterChart2 = new Chart(ctxTDSMeter2, {
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
    const ctxSoilMoisture2 = document.getElementById("SoilMoistureChart2").getContext("2d");
    const SoilMoistureChart2 = new Chart(ctxSoilMoisture2, {
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

      if (DHT11Chart2.data.labels.length > MAX_DATA_COUNT) {
        removeFirstData(DHT11Chart2);
      }
      if (TDSMeterChart2.data.labels.length > MAX_DATA_COUNT) {
        removeFirstData(TDSMeterChart2);
      }
      if (SoilMoistureChart2.data.labels.length > MAX_DATA_COUNT) {
        removeFirstData(SoilMoistureChart2);
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
        txtBlindMotor.innerText = "Right Container Blinds: Close";
      }else if(msg.values.temperature <20){
        txtDHT11Status.innerText = "Cooling"
        tempStatus = 1;
        txtDHT11Status.style.color = "blue";
        txtBlindMotor.innerText = "Right Container Blinds: Open";
      }else{
        tempStatus = 2;
        txtDHT11Status.innerText = "Normal"
        txtDHT11Status.style.color = "green";
        txtBlindMotor.innerText = "Right Container Blinds: Open";
      }
      addData(DHT11Chart2, msg.date, [ msg.values.temperature_c2]);
      if(msg.values.temperature_c2 < 1){
        tempStatus2 = -1;
        txtDHT11Status2.innerText = "Sensor not found"
        txtDHT11Status2.style.color = "red";
      }else if(msg.values.temperature_c2 > 30){
        txtDHT11Status2.innerText = "Critical"
        tempStatus2 = 3;
        txtDHT11Status2.style.color = "red";
        txtBlindMotor2.innerText = "Left Container Blinds: Close";
      }else if(msg.values.temperature_c2 <20){
        txtDHT11Status2.innerText = "Cooling"
        tempStatus2 = 1;
        txtDHT11Status2.style.color = "blue";
        txtBlindMotor2.innerText = "Left Container Blinds: Open";
      }else{
        tempStatus2 = 2;
        txtDHT11Status2.innerText = "Normal"
        txtDHT11Status2.style.color = "green";
        txtBlindMotor2.innerText = "Left Container Blinds: Open";
      }
      if(msg.values.salinity < 300){
          salinityStatus = 1;
          txtTDSStatus.innerText = "Low Salinity";
          txtTDSStatus.style.color = "red";
      }else if(msg.values.salinity >= 300 && msg.values.salinity <= 800){
          salinityStatus = 2;
          txtTDSStatus.innerText = "Moderate Salinity";
          txtTDSStatus.style.color = "green";
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
      //sensor salinity 2
      if(msg.values.salinity_c2 < 300){
        salinityStatus2 = 1;
        txtTDSStatus2.innerText = "Low Salinity";
        txtTDSStatus2.style.color = "red";
    }else if(msg.values.salinity_c2 >= 300 && msg.values.salinity_c2 <= 800){
        salinityStatus2 = 2;
        txtTDSStatus2.innerText = "Moderate Salinity";
        txtTDSStatus2.style.color = "green";
    }else{
        salinityStatus2 = 3;
        txtTDSStatus2.innerText = "High Salinity";
        txtTDSStatus2.style.color = "red";
        //if(soilCounter <= 0){
        //    txtWaterSalinityMotor.innerText = "Pumping water Now...";
        //    txtWaterMotor.innerText = "Water Pump: Enabled";
        //  }else {
        //    txtWaterMotor.innerText = "Water Pump: Disabled";
        //    }
        //txtWaterSalinityMotor.style.color = "blue";
    }
    
    
    
    //soil moisture sensor 1
      if(msg.values.moisture < 5){
          soilStatus = 1;
          txtSoilMoistureStatus.innerText = "Dry";
          txtSoilMoistureStatus.style.color = "red";
          
      }else if(msg.values.moisture >= 5 && msg.values.moisture <= 5.7){
          soilStatus = 2;
          txtSoilMoistureStatus.innerText = "Moist";
          txtSoilMoistureStatus.style.color = "green";
      }else{
          soilStatus = 3;
          txtSoilMoistureStatus.innerText = "Wet";
          txtSoilMoistureStatus.style.color = "green";
      }
      //soil moisture 2
      if(msg.values.moisture_c2 < 5){
        soilStatus2 = 1;
        txtSoilMoistureStatus2.innerText = "Dry";
        txtSoilMoistureStatus2.style.color = "red";
        
    }else if(msg.values.moisture_c2 >= 5 && msg.values.moisture_c2 <= 5.7){
        soilStatus2 = 2;
        txtSoilMoistureStatus2.innerText = "Moist";
        txtSoilMoistureStatus2.style.color = "green";
    }else{
        soilStatus2 = 3;
        txtSoilMoistureStatus2.innerText = "Wet";
        txtSoilMoistureStatus2.style.color = "green";
    }
    
    
    
    txtTemperature2.innerText = msg.values.temperature_c2 + " °C";
      txtTemperature.innerText = msg.values.temperature + " °C";
      addData(TDSMeterChart, msg.date, [msg.values.salinity]);
      addData(TDSMeterChart2, msg.date, [msg.values.salinity_c2]);
      txtWaterSalinity.innerText = msg.values.salinity + " ppm";
      txtWaterSalinity2.innerText = msg.values.salinity_c2 + " ppm";
      addData(SoilMoistureChart, msg.date, [msg.values.moisture]);
      txtSoilMoisture.innerText = msg.values.moisture + "mL";

      addData(SoilMoistureChart2, msg.date, [msg.values.moisture_c2]);
      txtSoilMoisture2.innerText = msg.values.moisture_c2 + "mL";
      var overallStatus = soilStatus + salinityStatus + tempStatus;
      var overallStatus2 = soilStatus2 + salinityStatus2 + tempStatus2;
      if(overallStatus2 <= 4){
        txtOverallStatus2.innerText = "Suboptimal";
        txtOverallDescription2.innerText = "Seedlings categorized as Suboptimal are experiencing conditions less conducive to optimal growth, including extremes in temperature, inadequate soil moisture, or high levels of soil salinity. While they may still survive and grow to some extent, their overall";
      }else if(overallStatus2 == 5){
        txtOverallStatus2.innerText = "Normal";
        txtOverallDescription2.innerText = "Seedlings classified as Normal are in good condition, displaying satisfactory growth and development, and seedlings growing under ideal conditions in one or more environmental factors, such as normal temperature, moist soil, and moderate salinity.";
        }else{
          txtOverallStatus2.innerText = "Optimal";
          txtOverallDescription2.innerText = "In the Optimal category, seedlings thrive under low conditions, which require moderate temperatures, adequate soil moisture, and low to moderate soil salinity.";
          }
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
      txtAverageWaterSalinity.innerText = ((msg.values.salinity + msg.values.salinity_c2)/2).toFixed(2) + " ppm";
      txtAverageSoilMoisture.innerText = ((msg.values.moisture + msg.values.moisture_c2)/2).toFixed(2) + " mL";
      
      var averageWaterSalinity = (msg.values.salinity + msg.values.salinity_c2)/2;
      var averageSoilMoisture = (msg.values.moisture + msg.values.moisture_c2)/2;
      //average salinity
    if(averageWaterSalinity < 300){
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
    }else if(averageWaterSalinity >= 300 && averageWaterSalinity <= 800){
        txtWaterSalinityMotor.style.color = "black";
        txtFertilizerMotor.innerText = "Fertilizer Motor: Disabled";
        txtFertilizerMotor.style.color = "grey";
        txtWaterSalinityMotor.innerText = " ";
        
    }else{
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
    //average soil moisture
      if(averageSoilMoisture < 5){
        txtSoilMoistureMotor.innerText = "Dispensing Water";
        txtWaterMotor.innerText = "Water Pump: Enabled";
        txtWaterMotor.style.color = "blue";
        txtSoilMoistureMotor.style.color = "blue";
        
    }else if(averageSoilMoisture >= 5 && averageSoilMoisture <= 5.7){
        txtSoilMoistureMotor.innerText = " ";
        txtWaterMotor.innerText = "Water Pump: Disabled";
        txtWaterMotor.style.color = "grey";
        txtSoilMoistureMotor.style.color = "grey";
    }else{
        txtSoilMoistureMotor.innerText = " ";
        txtWaterMotor.innerText = "Water Pump: Disabled";
        txtWaterMotor.style.color = "grey";
        txtSoilMoistureMotor.style.color = "grey";
    }
    });
  });
  
