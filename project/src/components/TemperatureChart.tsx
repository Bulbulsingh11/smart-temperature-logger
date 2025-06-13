import React, { useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

interface TemperatureReading {
  temperature: number;
  timestamp: string;
  id: number;
}

interface TemperatureChartProps {
  data: TemperatureReading[];
  isConnected: boolean;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, isConnected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find temperature range
    const temperatures = data.map(d => d.temperature);
    const minTemp = Math.min(...temperatures) - 1;
    const maxTemp = Math.max(...temperatures) + 1;
    const tempRange = maxTemp - minTemp;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (width - 2 * padding) * (i / 10);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw temperature line
    if (data.length > 1) {
      ctx.beginPath();
      
      data.forEach((reading, index) => {
        const x = padding + (width - 2 * padding) * (index / (data.length - 1));
        const y = height - padding - (height - 2 * padding) * ((reading.temperature - minTemp) / tempRange);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // Fill area under the curve
      const lastX = padding + (width - 2 * padding);
      const lastY = height - padding - (height - 2 * padding) * ((data[data.length - 1].temperature - minTemp) / tempRange);
      
      ctx.lineTo(lastX, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw the line
      ctx.beginPath();
      data.forEach((reading, index) => {
        const x = padding + (width - 2 * padding) * (index / (data.length - 1));
        const y = height - padding - (height - 2 * padding) * ((reading.temperature - minTemp) / tempRange);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw data points
      data.forEach((reading, index) => {
        const x = padding + (width - 2 * padding) * (index / (data.length - 1));
        const y = height - padding - (height - 2 * padding) * ((reading.temperature - minTemp) / tempRange);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = reading.temperature > 35 ? '#EF4444' : '#3B82F6';
        ctx.fill();
        
        // Add white border to points
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Draw temperature labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const temp = minTemp + (tempRange * (5 - i) / 5);
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.fillText(`${temp.toFixed(1)}°C`, padding - 10, y + 4);
    }

    // Draw time labels
    ctx.textAlign = 'center';
    if (data.length > 0) {
      const firstTime = new Date(data[0].timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const lastTime = new Date(data[data.length - 1].timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      ctx.fillText(firstTime, padding, height - 10);
      ctx.fillText(lastTime, width - padding, height - 10);
    }

  }, [data]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Temperature Trends</h2>
        <TrendingUp className="w-6 h-6 text-blue-400" />
      </div>

      <div className="relative h-64 sm:h-80">
        {isConnected && data.length > 0 ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-white/50 mb-2">
                {!isConnected ? 'Connecting to server...' : 'Waiting for data...'}
              </div>
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-xs text-white/70">
          <span>Data points: {data.length}</span>
          <span>Range: {data.length > 1 ? `${Math.min(...data.map(d => d.temperature)).toFixed(1)}°C - ${Math.max(...data.map(d => d.temperature)).toFixed(1)}°C` : 'N/A'}</span>
        </div>
      )}
    </div>
  );
};

export default TemperatureChart;