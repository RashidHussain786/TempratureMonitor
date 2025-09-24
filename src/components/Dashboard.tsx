import React, { useState, useEffect } from 'react';
import { LogOut, Thermometer, Clock, Database, RefreshCw, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TemperatureCard from './TemperatureCard';
import TemperatureChart from './TemperatureChart';
import DataTable from './DataTable';
import AddTemperatureForm from './AddTemperatureForm';


interface RoomSummary {
  roomId: string;
  currentTemp: number | null;
  status: 'normal' | 'hot' | 'cold' | 'no_data';
  lastUpdate: string | null;
}

interface DashboardData {
  rooms: RoomSummary[];
  totalReadings: number;
  lastSystemUpdate: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [rooms, setRooms] = useState<string[]>(['B206', 'B207', 'B208', 'B209', 'B210', 'Tent-2', 'Tent-3']);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SCRIPT_URL}?path=dashboard-summary`, { redirect: 'follow' });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Error fetching dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SCRIPT_URL}?path=rooms`, { redirect: 'follow' });
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRooms();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(), 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleAddReadings = async (readings: { roomId: string; temperature: number }[]) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SCRIPT_URL}?path=temperature-readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ readings }),
        redirect: 'follow'
      });

      if (response.ok) {
        setShowAddForm(false);
        fetchDashboardData(true);
      } else {
        console.error('Failed to add readings');
      }
    } catch (error) {
      console.error('Error adding readings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Thermometer className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Temperature Monitor</h1>
                <p className="text-sm text-gray-500">Data Room Monitoring System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Readings</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome, {user?.username}</span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Thermometer },
              { id: 'charts', name: 'Temperature Charts', icon: Clock },
              { id: 'data', name: 'Raw Data', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showAddForm && (
          <div className="mb-6">
            <AddTemperatureForm onAddReadings={handleAddReadings} rooms={rooms} />
          </div>
        )}

        {dashboardData && (
          <>
            {/* System Status */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(dashboardData.lastSystemUpdate).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Readings</p>
                  <p className="text-2xl font-bold text-blue-600">{dashboardData.totalReadings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {dashboardData.rooms.map((room) => (
                  <TemperatureCard key={room.roomId} room={room} />
                ))}
              </div>
            )}

            {activeTab === 'charts' && <TemperatureChart />}

            {activeTab === 'data' && <DataTable />}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;