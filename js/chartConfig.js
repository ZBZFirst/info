// chartConfig.js

/**
 * COLOR PALETTE - Centralized for easy theming
 * Using perceptually uniform, colorblind-friendly palette
 */
const COLORS = {
  flow: '#E15759',    // Red
  pressure: '#4E79A7', // Blue
  volume: '#F28E2B',   // Orange
  phase: '#76B7B2',    // Teal
  grid: 'rgba(0, 0, 0, 0.1)',
  background: '#ffffff'
};

/**
 * BASE CONFIGURATIONS - Shared settings for different chart types
 */

// Common settings for all time-series charts
const TIME_SERIES_BASE = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Critical for performance
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

// Special settings for loop charts (PV, FV)
const LOOP_CHART_BASE = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    elements: {
      line: {
        tension: 0 // Straight lines between points
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

/**
 * CHART FACTORIES - Reusable creation patterns
 */

// Creates configuration for single metric time-series
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
        title: { text: `${metric} (${getUnits(metric)})` }
      }
    }
  }
});

// Creates configuration for parametric (loop) charts
const createLoopChart = (xMetric, yMetric) => ({
  ...LOOP_CHART_BASE,
  data: {
    datasets: [{
      label: `${yMetric} vs ${xMetric}`,
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
        title: { text: `${xMetric} (${getUnits(xMetric)})` }
      },
      y: {
        ...LOOP_CHART_BASE.options.scales.y,
        title: { text: `${yMetric} (${getUnits(yMetric)})` }
      }
    }
  }
});

/**
 * UNIT CONFIGURATION - For axis labeling
 */
const getUnits = (metric) => {
  const units = {
    flow: 'mL/s',
    pressure: 'cmH₂O',
    volume: 'mL',
    phase: 'rad'
  };
  return units[metric] || '';
};

/**
 * EXPORTED CONFIGURATIONS - Ready-to-use chart configs
 */
export const CHART_CONFIGS = {
  // Comprehensive multi-line chart
  overview: {
    ...TIME_SERIES_BASE,
    data: {
      datasets: ['flow', 'pressure', 'volume'].map(metric => ({
        label: metric,
        borderColor: COLORS[metric],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        data: []
      }))
    }
  },

  // Individual metric charts
  flow: createTimeSeries('flow'),
  pressure: createTimeSeries('pressure'),
  volume: createTimeSeries('volume'),

  // Loop charts
  pvLoop: createLoopChart('volume', 'pressure'),
  fvLoop: createLoopChart('volume', 'flow')
};
