import React, { useState, useEffect } from 'react';

interface AddTemperatureFormProps {
  onAddReadings: (readings: { roomId: string; temperature: number }[]) => void;
  rooms: string[];
}

const AddTemperatureForm: React.FC<AddTemperatureFormProps> = ({ onAddReadings, rooms }) => {
  const [temperatures, setTemperatures] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const initialTemperatures = rooms.reduce((acc, room) => {
      acc[room] = '';
      return acc;
    }, {} as {[key: string]: string});
    setTemperatures(initialTemperatures);
  }, [rooms]);

  const handleChange = (roomId: string, value: string) => {
    setTemperatures(prev => ({ ...prev, [roomId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const readings = Object.entries(temperatures)
      .filter(([, temperature]) => temperature !== '')
      .map(([roomId, temperature]) => ({
        roomId,
        temperature: parseFloat(temperature),
      }));
    onAddReadings(readings);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Temperature Readings</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(roomId => (
            <div key={roomId} className="flex flex-col">
              <label htmlFor={`temp-${roomId}`} className="font-semibold mb-1">{`Room ${roomId}`}</label>
              <input
                id={`temp-${roomId}`}
                type="number"
                step="0.1"
                value={temperatures[roomId] || ''}
                onChange={(e) => handleChange(roomId, e.target.value)}
                className="p-2 border rounded-md"
                placeholder="Enter temperature"
              />
            </div>
          ))}
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Add Readings
        </button>
      </form>
    </div>
  );
};

export default AddTemperatureForm;