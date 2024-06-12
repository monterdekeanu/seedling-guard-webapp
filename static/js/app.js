$(document).ready(function () {
  const ctx = document.getElementById("myChart").getContext("2d");

  // const myChart = new Chart(ctx, {
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

  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [{
        label: "humidity",
        data: humidityData,
        borderColor: "red",
        fill: false
      },{
        label: "temperature",
        data: temperatureData,
        borderColor: "green",
        fill: false
      }]
    },
    options: {
      legend: {display: true}
    }
  });

  // function addData(label, data) {
  //   myChart.data.labels.push(label);
  //   myChart.data.datasets.forEach((dataset) => {
  //     dataset.data.push(data);
  //   });
  //   myChart.update();
  // }
  
  // function removeFirstData() {
  //   myChart.data.labels.splice(0, 1);
  //   myChart.data.datasets.forEach((dataset) => {
  //     dataset.data.shift();
  //   });
  // }

  function addData(label, humidity, temperature) {
    myChart.data.labels.push(label);
    myChart.data.datasets[0].data.push(humidity);
    myChart.data.datasets[1].data.push(temperature);
    myChart.update();
  }

  function removeFirstData() {
    myChart.data.labels.splice(0, 1);
    myChart.data.datasets.forEach((dataset) => {
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
  //   if (myChart.data.labels.length > MAX_DATA_COUNT) {
  //     removeFirstData();
  //   }
  //   addData(msg.date, msg.values);
  // });
  socket.on("updateSensorData", function (msg) {
    console.log(msg);
    console.log("Received sensorData :: " + msg.date + " :: Humidity: " + msg.humidity + " :: Temperature: " + msg.temperature);
    // Show only MAX_DATA_COUNT data
    if (myChart.data.labels.length > MAX_DATA_COUNT) {
      removeFirstData();
    }
    addData(msg.date, msg.humidity, msg.temperature);
  });
});
