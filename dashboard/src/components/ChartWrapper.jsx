import { useMemo, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler
);

const COMPONENTS = { bar: Bar, line: Line, doughnut: Doughnut, pie: Pie };

export default function ChartWrapper({ type, data, options = {}, height = 280 }) {
  const Component = COMPONENTS[type] || Bar;

  const mergedOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
      ...(options.plugins || {})
    },
    ...options
  }), []);

  return (
    <div className="canvas-wrap" style={{ height }}>
      <Component data={data} options={mergedOptions} />
    </div>
  );
}
