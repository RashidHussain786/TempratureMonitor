import React, { useState, useEffect } from "react";

interface TemperatureReading {
    id: string;
    roomId: string;
    temperature: number;
    timestamp: string;
    status: string;
}

interface ChecklistTableProps {
    readings: TemperatureReading[];
    loading: boolean;
    rooms: string[];
}

const timeSlots = [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"
];

const ChecklistTable: React.FC<ChecklistTableProps> = ({ readings, loading, rooms }) => {
    const [selectedRoom, setSelectedRoom] = useState<string>(rooms[0] || '');
    const [currentPage, setCurrentPage] = useState(1);
    const daysPerPage = 7;

    // Reset page to 1 when rooms array changes
    useEffect(() => {
        setSelectedRoom(rooms[0] || '');
        setCurrentPage(1);
    }, [rooms]);

    const groupedByRoom: Record<string, Record<string, Record<string, number | null>>> = {};

    readings.forEach(r => {
        const roomId = r.roomId;
        const readingDate = new Date(r.timestamp);
        const date = readingDate.toISOString().split("T")[0];
        const hour = readingDate.getHours();

        if (!groupedByRoom[roomId]) {
            groupedByRoom[roomId] = {};
        }
        const groupedByDate = groupedByRoom[roomId];

        if (!groupedByDate[date]) {
            groupedByDate[date] = Object.fromEntries(timeSlots.map(t => [t, null]));
        }

        const slotHour = Math.floor(hour / 2) * 2;
        const nearestSlot = `${slotHour.toString().padStart(2, "0")}:00`;

        if (timeSlots.includes(nearestSlot)) {
            groupedByDate[date][nearestSlot] = r.temperature;
        }
    });

    const groupedForSelectedRoom = groupedByRoom[selectedRoom] || {};
    const sortedDates = Object.keys(groupedForSelectedRoom).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const totalPages = Math.ceil(sortedDates.length / daysPerPage);
    const startIndex = (currentPage - 1) * daysPerPage;
    const paginatedDates = sortedDates.slice(startIndex, startIndex + daysPerPage);

    const handleRoomChange = (room: string) => {
        setSelectedRoom(room);
        setCurrentPage(1);
    };

    if (loading && readings.length === 0) {
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
            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto">
                    {rooms.map(room => (
                        <button
                            key={room}
                            onClick={() => handleRoomChange(room)}
                            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                selectedRoom === room
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}>
                            Room {room}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="overflow-x-auto relative">
                {loading && readings.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}
                <table className={`min-w-full border border-gray-300 text-sm text-center ${loading ? 'opacity-50' : ''}`}>
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border px-2 py-2">Date</th>
                            {timeSlots.map(slot => (
                                <th key={slot} className="border px-2 py-2">{slot}</th>
                            ))}
                            <th className="border px-2 py-2">Remarks</th>
                            <th className="border px-2 py-2">Checked By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDates.map(date => (
                            <tr key={date} className="hover:bg-gray-50">
                                <td className="border px-2 py-2">{date}</td>
                                {timeSlots.map(slot => (
                                    <td key={slot} className="border px-2 py-2">
                                        {groupedForSelectedRoom[date][slot] !== null ? `${groupedForSelectedRoom[date][slot]}°C` : "-"}
                                    </td>
                                ))}
                                <td className="border px-2 py-2"><input type="text" className="w-full p-1 border-none bg-transparent focus:ring-0"/></td>
                                <td className="border px-2 py-2"><input type="text" className="w-full p-1 border-none bg-transparent focus:ring-0"/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedDates.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No data available for this room.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChecklistTable;