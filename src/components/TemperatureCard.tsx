import React from 'react';
import { Thermometer, AlertTriangle, Snowflake, CheckCircle } from 'lucide-react';

interface RoomSummary {
  roomId: string;
  currentTemp: number | null;
  status: 'normal' | 'hot' | 'cold' | 'no_data';
  lastUpdate: string | null;
}

interface TemperatureCardProps {
  room: RoomSummary;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({ room }) => {
  const getStatusIcon = () => {
    switch (room.status) {
      case 'hot':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cold':
        return <Snowflake className="h-5 w-5 text-blue-500" />;
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Thermometer className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (room.status) {
      case 'hot':
        return 'border-red-200 bg-red-50';
      case 'cold':
        return 'border-blue-200 bg-blue-50';
      case 'normal':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTemperatureColor = () => {
    switch (room.status) {
      case 'hot':
        return 'text-red-600';
      case 'cold':
        return 'text-blue-600';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 ${getStatusColor()} p-6 hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Office {room.roomId}</h3>
        {getStatusIcon()}
      </div>
      
      <div className="text-center">
        <div className={`text-3xl font-bold ${getTemperatureColor()} mb-2`}>
          {room.currentTemp !== null ? `${room.currentTemp}°C` : '--'}
        </div>
        
        <div className="text-sm text-gray-500">
          {room.status === 'no_data' ? (
            'No recent data'
          ) : (
            <>
              <span className="capitalize">{room.status}</span>
              {room.lastUpdate && (
                <div className="mt-1">
                  Last reading: {new Date(room.lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          Status: {room.status.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};

export default TemperatureCard;