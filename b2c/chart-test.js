const chartContainer = document.getElementById("cvChart");

const DATA_COUNT = 10;
const labels = [];
for (let i = 0; i <= DATA_COUNT; ++i) {
  labels.push(i.toString());
}
const datapoints = [0, 20, 20, 60, 60, 120, 180, 120, 125, 105, 110, 170];
const data = {
  labels: labels,
  datasets: [
    {
      label: "Cubic interpolation (monotone)",
      data: datapoints,
      borderColor: "rgb(115, 124, 250)",
      fill: {
        target: "origin",
        above: "rgb(243, 243, 254)",
      },
      cubicInterpolationMode: "monotone",
    },
  ],
};

new Chart(chartContainer, {
  type: "line",
  data: data,
  options: {
    interaction: {
      intersect: false,
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
      legend: {
        position: "top",
        display: false,
      },
      annotation: {
        annotations: {
          point1: {
            type: "point",
            xValue: 2,
            yValue: 20,
            backgroundColor: "rgba(115, 124, 250, 0.25)",
            borderColor: "rgb(115, 124, 250)",
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  },
});
