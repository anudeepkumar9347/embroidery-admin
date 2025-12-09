import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
      await fetch(`${baseUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      setStatus('connected');
      setLastChecked(new Date());
    } catch (error) {
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'disconnected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'checking':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi size={16} />;
      case 'disconnected':
        return <WifiOff size={16} />;
      case 'checking':
        return <AlertCircle size={16} className="animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      case 'checking':
        return 'Checking...';
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${getStatusColor()}`}
      onClick={checkConnection}
      title={lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Click to check connection'}
    >
      {getIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  );
}
