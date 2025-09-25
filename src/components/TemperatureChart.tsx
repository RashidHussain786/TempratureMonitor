import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface TemperatureReading {
  id: string;
  roomId: string;
  temperature: number;
  timestamp: string;
  status: string;
}

interface TemperatureChartProps {
  rooms: string[];
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ rooms }) => {
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchData();
  }, [selectedRoom, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case '24h':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      let url = `${import.meta.env.VITE_SCRIPT_URL}?path=v2-temperature-data&startDate=${startDate.toISOString()}`;
      if (selectedRoom !== 'all') {
        url += `&roomId=${selectedRoom}`;
      }

      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) {
        const data = await response.json();
        setReadings(data.readings || []);
      } else {
        console.error('Error fetching chart data');
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!readings) {
      return { labels: [], datasets: [] };
    }

    const colors = {
      B206: 'rgb(239, 68, 68)',   // red
      B207: 'rgb(59, 130, 246)',  // blue
      B208: 'rgb(16, 185, 129)',  // green
      B209: 'rgb(245, 158, 11)',  // yellow
      B210: 'rgb(139, 92, 246)',  // purple
      'Tent-2': 'rgb(255, 99, 132)', // pink
      'Tent-3': 'rgb(75, 192, 192)', // teal
    };

    const datasets = (selectedRoom === 'all' ? rooms : [selectedRoom]).map(roomId => {
      const roomReadings = readings
        .filter(r => r.roomId === roomId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return {
        label: `Office ${roomId}`,
        data: roomReadings.map(r => ({ x: new Date(r.timestamp).getTime(), y: r.temperature })),
        borderColor: colors[roomId as keyof typeof colors] || '#ccc',
        backgroundColor: (colors[roomId as keyof typeof colors] || '#ccc') + '20',
        fill: false,
        tension: 0.1,
      };
    });

    return { datasets };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedRoom === 'all'
          ? 'Temperature Trends - All Offices'
          : `Temperature Trend - Office ${selectedRoom}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
      },
      x: {
        type: 'time' as const,
        time: {
          unit: 'hour' as const,
          tooltipFormat: 'MMM d, yyyy, h:mm a',
          displayFormats: {
            hour: 'h:mm a'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-900">Temperature Charts</h2>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { value: '24h', label: '24H' },
              { value: '7d', label: '7D' },
              { value: '30d', label: '30D' },
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                  dateRange === range.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}>
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Offices</option>
          {rooms.map(room => (
            <option key={room} value={room}>Office {room}</option>
          ))}
        </select>
      </div>

      <div className="h-96 relative">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )}
        <Line data={getChartData()} options={options} />
      </div>
    </div>
  );
};

export default TemperatureChart;