import React, { useState } from 'react';

interface ExportFormProps {
  rooms: string[];
  onExport: (room: string, startDate: string, endDate: string) => void;
  onClose: () => void;
}

const toInputDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
}

const ExportForm: React.FC<ExportFormProps> = ({ rooms, onExport, onClose }) => {
  const [selectedRoom, setSelectedRoom] = useState<string>(rooms[0] || '');
  const [startDate, setStartDate] = useState<string>(toInputDateString(new Date()));
  const [endDate, setEndDate] = useState<string>(toInputDateString(new Date()));
  const [error, setError] = useState<string | null>(null);

  const handleExportClick = () => {
    if (new Date(endDate) < new Date(startDate)) {
        setError('End date cannot be before start date.');
        return;
    }
    setError(null);
    onExport(selectedRoom, startDate, endDate);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="room-select" className="block text-sm font-medium text-gray-700 mb-1">
          Office
        </label>
        <select
          id="room-select"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {rooms.map(room => (
            <option key={room} value={room}>Office {room}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
            </label>
            <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
        <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
            </label>
            <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
      </div>

        {error && (
            <div className="text-sm text-red-600">
                {error}
            </div>
        )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleExportClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default ExportForm;