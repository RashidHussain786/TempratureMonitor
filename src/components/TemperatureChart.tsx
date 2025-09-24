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

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS5kIJqb4eOkNx8HdnpLQevtkcmcJr0Cr2tMkdURVee2wDz_6axgqv7_z8ttxoXZDX/exec';

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

const TemperatureChart: React.FC = () => {
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const ROOMS = ['B206', 'B207', 'B208', 'B209', 'B210', 'Tent-2', 'Tent-3'];

  useEffect(() => {
    fetchTemperatureData();
  }, [selectedRoom]);

  const fetchTemperatureData = async () => {
    try {
      const url = `${SCRIPT_URL}?path=temperature-data`;

      const response = await fetch(url, { redirect: 'follow' });

      if (response.ok) {
        const data = await response.json();
        let readings = data.readings;
        if (selectedRoom !== 'all') {
          readings = readings.filter(r => r.roomId === selectedRoom);
        }
        setReadings(readings);
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const colors = {
      B206: 'rgb(239, 68, 68)',   // red
      B207: 'rgb(59, 130, 246)',  // blue
      B208: 'rgb(16, 185, 129)',  // green
      B209: 'rgb(245, 158, 11)',  // yellow
      B210: 'rgb(139, 92, 246)',  // purple
      'Tent-2': 'rgb(255, 99, 132)', // pink
      'Tent-3': 'rgb(75, 192, 192)', // teal
    };

    if (selectedRoom !== 'all') {
      const roomReadings = readings
        .filter(r => r.roomId === selectedRoom)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return {
        labels: roomReadings.map(r => new Date(r.timestamp).toLocaleTimeString()),
        datasets: [{
          label: `Room ${selectedRoom}`,
          data: roomReadings.map(r => r.temperature),
          borderColor: colors[selectedRoom as keyof typeof colors],
          backgroundColor: colors[selectedRoom as keyof typeof colors] + '20',
          fill: false,
          tension: 0.1,
        }]
      };
    }

    const datasets = ROOMS.map(roomId => {
      const roomReadings = readings
        .filter(r => r.roomId === roomId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-20); // Last 20 readings per room

      return {
        label: `Room ${roomId}`,
        data: roomReadings.map(r => r.temperature),
        borderColor: colors[roomId as keyof typeof colors],
        backgroundColor: colors[roomId as keyof typeof colors] + '20',
        fill: false,
        tension: 0.1,
      };
    });

    // Use timestamps from the most recent room data for labels
    const allTimestamps = readings
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-20)
      .map(r => new Date(r.timestamp).toLocaleTimeString());

    return {
      labels: allTimestamps,
      datasets
    };
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
          ? 'Temperature Trends - All Rooms'
          : `Temperature Trend - Room ${selectedRoom}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
        min: 16,
        max: 28,
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Temperature Charts</h2>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Rooms</option>
          {ROOMS.map(room => (
            <option key={room} value={room}>Room {room}</option>
          ))}
        </select>
      </div>

      <div className="h-96">
        <Line data={getChartData()} options={options} />
      </div>
    </div>
  );
};

export default TemperatureChart;