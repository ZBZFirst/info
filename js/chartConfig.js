// chartConfig.js

const COLORS = {
  flow: '#E15759',    // Red
  pressure: '#4E79A7', // Blue
  volume: '#F28E2B',   // Orange
  phase: '#76B7B2',    // Teal
  grid: 'rgba(0, 0, 0, 0.1)',
  background: '#ffffff'
};

const AXIS_RANGES = {
  flow: { min: 500, max: 850 },
  pressure: { min: 300, max: 550 },
  volume: { min: 200, max: 370 },
  phase: { min: -1, max: 3 }
};

const TIME_SERIES_BASE = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Time (ms)' },
        grid: { color: COLORS.grid }
      },
      y: {
        title: { display: true },
        grid: { color: COLORS.grid }
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y?.toFixed(2) || 'N/A'}`
        }
      }
    }
  }
};

const LOOP_CHART_BASE = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    elements: {
      line: {
        tension: 0
      }
    },
    scales: {
      x: {
        title: { display: true },
        grid: { color: COLORS.grid }
      },
      y: {
        title: { display: true },
        grid: { color: COLORS.grid }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => 
            `X: ${context.parsed.x?.toFixed(2)}, Y: ${context.parsed.y?.toFixed(2)}`
        }
      }
    }
  }
};



const createTimeSeries = (metric, showPoints = false) => ({
  ...TIME_SERIES_BASE,
  data: {
    datasets: [{
      label: metric,
      borderColor: COLORS[metric] || COLORS.flow,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: showPoints ? 3 : 0,
      pointHoverRadius: 5,
      fill: false,
      data: []
    }]
  },
  options: {
    ...TIME_SERIES_BASE.options,
    scales: {
      ...TIME_SERIES_BASE.options.scales,
      y: {
        ...TIME_SERIES_BASE.options.scales.y,
        min: AXIS_RANGES[metric].min,
        max: AXIS_RANGES[metric].max,
        title: { text: `${metric} (${getUnits(metric)})` }
      }
    }
  }
});

const createLoopChart = (yMetric) => ({
  ...LOOP_CHART_BASE,
  data: {
    datasets: [{
      label: `${yMetric} vs Volume`,
      borderColor: COLORS[yMetric],
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      data: []
    }]
  },
  options: {
    ...LOOP_CHART_BASE.options,
    scales: {
      x: {
        ...LOOP_CHART_BASE.options.scales.x,
        min: AXIS_RANGES.volume.min,
        max: AXIS_RANGES.volume.max,
        title: { 
          display: true,
          text: `Volume (${getUnits('volume')})` 
        }
      },
      y: {
        ...LOOP_CHART_BASE.options.scales.y,
        min: AXIS_RANGES[yMetric].min,
        max: AXIS_RANGES[yMetric].max,
        title: { 
          display: true,
          text: `${yMetric} (${getUnits(yMetric)})` 
        }
      }
    }
  }
});

const getUnits = (metric) => {
  const units = {flow: 'mL/s',pressure: 'cmH₂O',volume: 'mL',phase: 'rad'};
  return units[metric] || '';};

export const CHART_CONFIGS = {
overview: {...TIME_SERIES_BASE,data: {datasets: ['flow', 'pressure', 'volume'].map(metric => ({label: metric,borderColor: COLORS[metric],backgroundColor: 'transparent',borderWidth: 2,pointRadius: 0,fill: false,data: []}))},
  options: {...TIME_SERIES_BASE.options,scales: {...TIME_SERIES_BASE.options.scales,y: {...TIME_SERIES_BASE.options.scales.y,min: Math.min(...Object.values(AXIS_RANGES).map(r => r.min)),max: Math.max(...Object.values(AXIS_RANGES).map(r => r.max))}}}},
  flow: createTimeSeries('flow'),
  pressure: createTimeSeries('pressure'),
  volume: createTimeSeries('volume'),

  pvLoop: createLoopChart('pressure'),
  fvLoop: createLoopChart('flow')
};

