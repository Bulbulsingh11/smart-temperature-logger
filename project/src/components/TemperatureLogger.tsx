import React, { useState, useEffect, useCallback } from 'react';
import { Thermometer, Download, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import TemperatureDisplay from './TemperatureDisplay';
import TemperatureChart from './TemperatureChart';
import AlertSystem from './AlertSystem';

interface TemperatureReading {
  temperature: number;
  timestamp: string;
  id: number;
}

interface WebSocketMessage {
  type: 'temperature' | 'initial';
  data: TemperatureReading | {
    current: number;
    history: TemperatureReading[];
  };
}

const TemperatureLogger: React.FC = () => {
  const [currentTemp, setCurrentTemp] = useState<number>(0);
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureReading[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<TemperatureReading[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Get the correct server URL for both development and production
  const getServerUrl = () => {
    // For Railway deployment, use explicit WebSocket path
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  };

  const getApiUrl = () => {
    // Always use the same host as the frontend for Railway deployment
    return `${window.location.protocol}//${window.location.host}`;
  };

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    const websocketUrl = getServerUrl();
    console.log('Connecting to WebSocket:', websocketUrl);
    const websocket = new WebSocket(websocketUrl);
    
    websocket.onopen = () => {
      console.log('Connected to temperature server');
      setIsConnected(true);
    };
    
    websocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'initial') {
          const data = message.data as { current: number; history: TemperatureReading[] };
          setCurrentTemp(data.current);
          setTemperatureHistory(data.history);
        } else if (message.type === 'temperature') {
          const reading = message.data as TemperatureReading;
          setCurrentTemp(reading.temperature);
          
          setTemperatureHistory(prev => {
            const updated = [...prev, reading];
            return updated.slice(-50); // Keep last 50 readings
          });
          
          // Check for high temperature alert
          if (reading.temperature > 35) {
            setAlerts(prev => {
              const newAlerts = [reading, ...prev.slice(0, 4)]; // Keep last 5 alerts
              return newAlerts;
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = (event) => {
      console.log('Disconnected from temperature server', event.code, event.reason);
      setIsConnected(false);
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    setWs(websocket);
    
    return websocket;
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocket = connectWebSocket();
    
    return () => {
      websocket?.close();
    };
  }, [connectWebSocket]);

  // Download CSV function
  const downloadCSV = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/temperature/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'temperature-log.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  // Clear alerts function
  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Thermometer className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Smart Temperature Logger
            </h1>
          </div>
          <p className="text-white/80 text-lg">
            Real-time temperature monitoring with intelligent alerts
          </p>
        </div>

        {/* Connection Status & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Disconnected</span>
              </>
            )}
          </div>
          
          <button
            onClick={downloadCSV}
            disabled={!isConnected || temperatureHistory.length === 0}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Alert System */}
        {alerts.length > 0 && (
          <AlertSystem alerts={alerts} onClear={clearAlerts} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Temperature Display */}
          <div className="lg:col-span-1">
            <TemperatureDisplay 
              temperature={currentTemp}
              isConnected={isConnected}
            />
          </div>
          
          {/* Temperature Chart */}
          <div className="lg:col-span-2">
            <TemperatureChart 
              data={temperatureHistory}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {temperatureHistory.length > 0 && (
            <>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.max(...temperatureHistory.map(r => r.temperature)).toFixed(1)}°C
                </div>
                <div className="text-white/70 text-sm">Highest</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.min(...temperatureHistory.map(r => r.temperature)).toFixed(1)}°C
                </div>
                <div className="text-white/70 text-sm">Lowest</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {(temperatureHistory.reduce((sum, r) => sum + r.temperature, 0) / temperatureHistory.length).toFixed(1)}°C
                </div>
                <div className="text-white/70 text-sm">Average</div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-white/60 text-sm">
          <p>Simulated temperature data • Updates every 5 seconds</p>
          <p className="mt-1">
            Readings: {temperatureHistory.length} • 
            Alerts: {alerts.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemperatureLogger;
