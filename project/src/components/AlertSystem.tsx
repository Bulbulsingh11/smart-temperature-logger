import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Volume2, VolumeX } from 'lucide-react';

interface TemperatureReading {
  temperature: number;
  timestamp: string;
  id: number;
}

interface AlertSystemProps {
  alerts: TemperatureReading[];
  onClear: () => void;
}

const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onClear }) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      } catch (error) {
        console.log('Audio not supported');
      }
    };

    if (soundEnabled && !audioContext) {
      initAudio();
    }
  }, [soundEnabled, audioContext]);

  // Play alert sound
  const playAlertSound = () => {
    if (!audioContext || !soundEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Play sound when new alert is added
  useEffect(() => {
    if (alerts.length > 0 && soundEnabled) {
      playAlertSound();
    }
  }, [alerts.length, soundEnabled]);

  if (alerts.length === 0) return null;

  const latestAlert = alerts[0];

  return (
    <div className="mb-6">
      <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm rounded-xl p-4 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-semibold text-lg mb-1">
                High Temperature Alert!
              </h3>
              <p className="text-red-300 mb-2">
                Temperature has exceeded 35°C threshold
              </p>
              <div className="bg-red-500/30 rounded-lg p-3 mb-3">
                <div className="text-red-200 text-sm">
                  <strong>Current:</strong> {latestAlert.temperature.toFixed(1)}°C
                </div>
                <div className="text-red-200 text-xs opacity-75">
                  {new Date(latestAlert.timestamp).toLocaleString()}
                </div>
              </div>
              
              {alerts.length > 1 && (
                <details className="text-red-300 text-sm">
                  <summary className="cursor-pointer hover:text-red-200">
                    View recent alerts ({alerts.length})
                  </summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {alerts.slice(1).map(alert => (
                      <div key={alert.id} className="text-xs text-red-200/75 bg-red-500/20 rounded p-2">
                        {alert.temperature.toFixed(1)}°C at {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
              title={soundEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-red-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
            </button>
            <button
              onClick={onClear}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
              title="Clear all alerts"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-2">
        <div className="inline-flex items-center gap-2 text-red-400 text-sm">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          <span>Active Alert</span>
        </div>
      </div>
    </div>
  );
};

export default AlertSystem;