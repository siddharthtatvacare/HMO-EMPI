import { useMemo, useRef, useCallback } from 'react';
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

export default function ChartWrapper({ type, data, options = {}, height = 280, onElementClick }) {
  const Component = COMPONENTS[type] || Bar;
  const chartRef = useRef(null);

  const handleClick = useCallback((event) => {
    if (!onElementClick || !chartRef.current) return;
    const chart = chartRef.current;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);
    if (elements.length > 0) {
      const { datasetIndex, index } = elements[0];
      const label = data.labels?.[index];
      const datasetLabel = data.datasets?.[datasetIndex]?.label;
      onElementClick({ datasetIndex, index, label, datasetLabel, value: data.datasets[datasetIndex]?.data[index] });
    }
  }, [onElementClick, data]);

  const mergedOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
      ...(options.plugins || {})
    },
    ...options,
    ...(onElementClick ? { onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    }} : {}),
  }), [options, onElementClick]);

  return (
    <div className="canvas-wrap" style={{ height }}>
      <Component ref={chartRef} data={data} options={mergedOptions} onClick={onElementClick ? handleClick : undefined} />
    </div>
  );
}
