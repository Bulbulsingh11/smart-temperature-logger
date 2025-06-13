import React from 'react';
import { Thermometer } from 'lucide-react';

interface TemperatureDisplayProps {
  temperature: number;
  isConnected: boolean;
}

const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({ 
  temperature, 
  isConnected 
}) => {
  // Determine temperature color and status
  const getTemperatureStatus = (temp: number) => {
    if (temp < 25) return { color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20', status: 'Cool' };
    if (temp < 30) return { color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/20', status: 'Normal' };
    if (temp < 35) return { color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20', status: 'Warm' };
    if (temp < 40) return { color: 'text-orange-400', bg: 'from-orange-500/20 to-red-500/20', status: 'Hot' };
    return { color: 'text-red-400', bg: 'from-red-500/20 to-pink-500/20', status: 'Critical' };
  };

  const tempStatus = getTemperatureStatus(temperature);

  return (
    <div className={`bg-gradient-to-br ${tempStatus.bg} backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Current Temperature</h2>
        <Thermometer className={`w-6 h-6 ${tempStatus.color}`} />
      </div>
      
      <div className="text-center">
        {isConnected ? (
          <>
            <div className={`text-6xl sm:text-7xl font-bold ${tempStatus.color} mb-2 transition-all duration-500`}>
              {temperature.toFixed(1)}
              <span className="text-3xl">°C</span>
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm`}>
              <span className={`text-sm font-medium ${tempStatus.color}`}>
                {tempStatus.status}
              </span>
            </div>
            
            {temperature > 35 && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg animate-pulse">
                <div className="text-red-400 text-sm font-medium">
                  ⚠️ High Temperature Alert
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl text-white/50 mb-2">--°C</div>
            <div className="text-white/50">Connecting...</div>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="text-xs text-white/70">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default TemperatureDisplay;