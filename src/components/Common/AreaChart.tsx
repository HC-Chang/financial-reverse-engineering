import React, { useMemo } from 'react';
import './AreaChart.css';

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface AreaChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  width = 500, 
  height = 200, 
  color = '#1abc9c' 
}) => {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    
    const maxX = Math.max(...data.map(p => p.x));
    const maxY = Math.max(...data.map(p => p.y)) || 1;
    const minX = Math.min(...data.map(p => p.x));

    const scaleX = (x: number) => {
      if (maxX === minX) return 0;
      return ((x - minX) / (maxX - minX)) * width;
    };
    const scaleY = (y: number) => height - (y / maxY) * height;

    return data.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ');
  }, [data, width, height]);

  const areaPath = useMemo(() => {
    if (!points) return '';
    return `M 0,${height} L ${points} L ${width},${height} Z`;
  }, [points, width, height]);

  return (
    <div className="area-chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="area-chart-svg">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGradient)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default AreaChart;
