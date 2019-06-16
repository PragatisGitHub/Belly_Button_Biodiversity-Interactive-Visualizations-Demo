function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text('BB_'+sample)
        .property("value", sample);
    });

  // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildMetadata(firstSample);
    buildPie(firstSample);
    buildBubble(firstSample);
  });
};

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildPie(newSample);
  buildBubble(newSample);   
};

function buildMetadata(sample) {
  d3.json('/metadata/' + sample).then(function (data)
  {
    var panel = d3.select('#sample-metadata')
    panel.html(' ')
    Object.entries(data).forEach(([key,value])=>
    {
     panel.append('h4').text(`${key}: ${value}`)  //h4 is appended as panel title is in h3
    })
  buildGauge(data.WFREQ);
})
};

function buildGauge(gaugedata){
  var gaugespace = d3.select('#gauge')
  gaugespace.html(' ')
  var wfreq = gaugedata
  var level = parseFloat(wfreq) * 20;
// Trig to calc meter point
  var degrees = 180 - level,
      radius = .6; 
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);   
  var y = radius * Math.sin(radians);
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',   // Traingle
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);
  var data = [
  {
    type: "scatter",
    x: [0],
    y: [0],
    marker: { size: 28, color: "850000" },
    showlegend: false,
    name: "Frequency",
    text: wfreq,
    hoverinfo: "text+name"
  },
  {
    values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
    rotation: 90,
    text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
    textinfo: "text",
    textposition: "inside",
    marker: {
      colors: [
        "rgba(0, 105, 11, .5)",
        "rgba(10, 120, 22, .5)",
        "rgba(14, 127, 0, .5)",
        "rgba(110, 154, 22, .5)",
        "rgba(170, 202, 42, .5)",
        "rgba(202, 209, 95, .5)",
        "rgba(210, 206, 145, .5)",
        "rgba(232, 226, 202, .5)",
        "rgba(240, 230, 215, .5)",
        "rgba(255, 255, 255, 0)"
      ]
    },
    labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
    hoverinfo: "label",
    hole: 0.5,
    type: "pie",
    showlegend: false
  }
];

var layout = {
  shapes: [
    {
      type: "path",
      path: path,
      fillcolor: "850000",
      line: {
        color: "850000"
      },
    }
  ],
  title: "<b>Belly Button Washing Frequency</b> <br> Scrubs per Week",
  height: 480,
  width: 500,
  xaxis: {
    zeroline: false,
    showticklabels: false,
    showgrid: false,
    range: [-1, 1]
  },
  yaxis: {
    zeroline: false,
    showticklabels: false,
    showgrid: false,
    range: [-1, 1]
  }
};
Plotly.newPlot('gauge', data, layout);
};

function buildPie(sample) {
// Fetch the sample data for the plots
  d3.json('/samples/'+sample).then(function (data){
  // Build a Pie Chart using the sample data (Top 10)
    Sliced_otu_ids = data.otu_ids.slice(1,11)
    Sliced_otu_labels = data.otu_labels.slice(1,11)
    Sliced_sample_values = data.sample_values.slice(1,11)
    var data = [{
      values: Sliced_sample_values,
      labels: Sliced_otu_ids,
      type: 'pie',
      name: "Top 10 samples",
      textinfo: 'percent',
      text:Sliced_otu_labels,
      textposition:'inside',
      hoverinfo:'text+values+labels'
    }];
    
    var layout = {
    title:"<b>Atmost Top 10 Samples<b>",    
    height: 480,
    width: 500
    };
      
    Plotly.newPlot('pie', data, layout);  
})
};
function buildBubble(sample) {
d3.json('/samples/' + sample).then(function (data)
{
  var data = [{
    x: data.otu_ids,
    y: data.sample_values,
    text: data.otu_labels,
    mode: 'markers',
    type:'scatter',
    marker:{color:data.otu_ids.map(d=>d),
      size:data.sample_values,
    colorscale:"Jet"}
  }];
  var layout = {
    title:"<b>Number of Germs per Sample for OTU ID<b>",
    xaxis:{title:"OTU ID",zeroline:true},
    yaxis:{title: "No. of germs in Sample",zeroline:true}
  };
  Plotly.newPlot('bubble',data,layout);  
})
};
// Initialize the dashboard
init();
