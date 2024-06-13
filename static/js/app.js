$(document).ready(function () {
  const ctx1 = document
    .getElementById("humidityTemperatureChart")
    .getContext("2d");

  const ctx2 = document.getElementById("tdsChart").getContext("2d");

  const ctx3 = document.getElementById("soilMoistureChart").getContext("2d");

  // const myChart1 = new Chart(ctx, {
  //   type: "line",
  //   data: {
  //     datasets: [
  //       { label: "Humidity" },
  //        {label: "Temperature"}
  //     ],
  //   },
  //   options: {
  //     borderWidth: 3,
  //     borderColor: ['rgba(255, 99, 132, 1)',],
  //   },
  // });
  const xValues = [];
  const humidityData = [];
  const temperatureData = [];
  const tdsData = [];
  const soilMoistureData = [];

  const myChart1 = new Chart(ctx1, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "humidity",
          data: humidityData,
          borderColor: "red",
          fill: false,
        },
        {
          label: "temperature",
          data: temperatureData,
          borderColor: "green",
          fill: false,
        },
      ],
    },
    options: {
      legend: { display: true },
    },
  });

  const myChart2 = new Chart(ctx2, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "tds",
          data: tdsData,
          borderColor: "red",
          fill: false,
        },
      ],
    },
    options: {
      legend: { display: true },
    },
  });

  const myChart3 = new Chart(ctx3, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "soil moisture data",
          data: soilMoistureData,
          borderColor: "red",
          fill: false,
        },
      ],
    },
    options: {
      legend: { display: true },
    },
  });

  // function addData(label, data) {
  //   myChart1.data.labels.push(label);
  //   myChart1.data.datasets.forEach((dataset) => {
  //     dataset.data.push(data);
  //   });
  //   myChart1.update();
  // }

  // function removeFirstData() {
  //   myChart1.data.labels.splice(0, 1);
  //   myChart1.data.datasets.forEach((dataset) => {
  //     dataset.data.shift();
  //   });
  // }

  function addData(date, humidity, temperature, tds, soilMoisture) {
    myChart1.data.labels.push(date);
    myChart1.data.datasets[0].data.push(humidity);
    myChart1.data.datasets[1].data.push(temperature);

    myChart2.data.labels.push(date);
    myChart2.data.datasets[0].data.push(tds);

    myChart3.data.labels.push(date);
    myChart3.data.datasets[0].data.push(soilMoisture);

    myChart1.update();
    myChart2.update();
    myChart3.update();
  }

  function removeFirstData() {
    myChart1.data.labels.splice(0, 1);
    myChart1.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });

    myChart2.data.labels.splice(0, 1);
    myChart2.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });

    myChart3.data.labels.splice(0, 1);
    myChart3.data.datasets.forEach((dataset) => {
      dataset.data.shift();
    });
  }

  const MAX_DATA_COUNT = 10;
  //connect to the socket server.
  //   var socket = io.connect("http://" + document.domain + ":" + location.port);
  var socket = io.connect();

  //receive details from server
  // socket.on("updateSensorData", function (msg) {
  //   console.log("Received sensorData :: " + msg.date + " :: " + msg.humid);
  //   console.log("Received sensorData :: " + msg.date + " :: Humidity: " + msg.humidity + " :: Temperature: " + msg.temperature);
  //   // Show only MAX_DATA_COUNT data
  //   if (myChart1.data.labels.length > MAX_DATA_COUNT) {
  //     removeFirstData();
  //   }
  //   addData(msg.date, msg.values);
  // });
  socket.on("updateSensorData", function (msg) {
    console.log(msg);
    console.log(
      "Received sensorData :: " +
        msg.date +
        " :: Humidity: " +
        msg.humidity +
        " :: Temperature: " +
        msg.temperature +
        " :: TDS: " +
        msg.tds +
        " :: Soil Moisture: " +
        msg.soilMoisture
    );
    // Show only MAX_DATA_COUNT data
    if (myChart1.data.labels.length > MAX_DATA_COUNT) {
      removeFirstData();
    }
    addData(
      msg.date,
      msg.humidity,
      msg.temperature,
      msg.tds,
      msg.soil_moisture
    );
  });
});
