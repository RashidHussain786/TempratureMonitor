import React, { useState, useEffect } from "react";
import { Download } from 'lucide-react';
import ExportModal from './ExportModal';
import ExportForm from './ExportForm';
import ExcelJS from 'exceljs';

interface TemperatureReading {
    id: string;
    roomId: string;
    temperature: number;
    timestamp: string;
    status: string;
}

interface ChecklistTableProps {
    rooms: string[];
}

const timeSlots = [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"
];

const generateChecklistXLSX = async (readings: TemperatureReading[], room: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Checklist');

    // Title
    const title = `Building No ${room} Data Room Temp Checklist`;
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { bold: true, size: 16 };
    worksheet.mergeCells(1, 1, 1, timeSlots.length + 3);
    titleRow.getCell(1).alignment = { horizontal: 'center' };

    worksheet.addRow([]); // Blank line

    // Headers
    const headerRow = worksheet.addRow(['Date', ...timeSlots, 'Remarks', 'Checked By']);
    headerRow.font = { bold: true };
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD3D3D3'} };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // Group data
    const grouped: Record<string, Record<string, number | null>> = {};
    readings.forEach(r => {
        const readingDate = new Date(r.timestamp);
        const date = readingDate.toISOString().split("T")[0];
        const hour = readingDate.getHours();

        if (!grouped[date]) {
            grouped[date] = Object.fromEntries(timeSlots.map(t => [t, null]));
        }

        const slotHour = Math.floor(hour / 2) * 2;
        const nearestSlot = `${slotHour.toString().padStart(2, "0")}:00`;

        if (timeSlots.includes(nearestSlot)) {
            grouped[date][nearestSlot] = r.temperature;
        }
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Add data rows
    sortedDates.forEach(date => {
        const rowData: (string | number | null)[] = [date];
        timeSlots.forEach(slot => {
            const temp = grouped[date][slot];
            rowData.push(temp !== null ? `${temp}°C` : "-");
        });
        rowData.push("", ""); // Empty Remarks and Checked By
        const dataRow = worksheet.addRow(rowData);

        // Style the data cells
        dataRow.eachCell((cell, colNumber) => {
            cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            if (colNumber > 1 && colNumber <= timeSlots.length + 1) {
                const tempValue = grouped[date][timeSlots[colNumber - 2]];
                if (tempValue !== null) {
                    if (tempValue > 24) {
                        cell.font = { color: { argb: 'FFFF0000' } }; // Red
                    } else if (tempValue < 18) {
                        cell.font = { color: { argb: 'FF0000FF' } }; // Blue
                    }
                }
            }
        });
    });

    // Adjust column widths
    worksheet.columns.forEach(column => {
        column.width = 12;
    });
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(timeSlots.length + 2).width = 30; // Remarks
    worksheet.getColumn(timeSlots.length + 3).width = 30; // Checked By

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

const ChecklistTable: React.FC<ChecklistTableProps> = ({ rooms }) => {
    const [readings, setReadings] = useState<TemperatureReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<string>(rooms[0] || '');
    const [currentPage, setCurrentPage] = useState(1); // 1 is the most recent week
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (rooms.length > 0 && !selectedRoom) {
            setSelectedRoom(rooms[0]);
        }
    }, [rooms, selectedRoom]);

    // Calculate date range for display and fetching
    const today = new Date();
    const weekOffset = (currentPage - 1) * 7;
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - weekOffset);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - weekOffset - 6);
    startDate.setHours(0, 0, 0, 0);

    useEffect(() => {
        if (selectedRoom) {
            fetchData();
        }
    }, [selectedRoom, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = `${import.meta.env.VITE_SCRIPT_URL}?path=v2-temperature-data&roomId=${selectedRoom}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

            const response = await fetch(url, { redirect: 'follow' });
            if (response.ok) {
                const data = await response.json();
                setReadings(data.readings || []);
            } else {
                console.error('Error fetching checklist data');
            }
        } catch (error) {
            console.error('Error fetching checklist data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (room: string, startDate: string, endDate: string) => {
        try {
            const url = `${import.meta.env.VITE_SCRIPT_URL}?path=v2-temperature-data&roomId=${room}&startDate=${startDate}&endDate=${endDate}`;
            const response = await fetch(url, { redirect: 'follow' });
            if (!response.ok) {
                throw new Error('Failed to fetch data for export');
            }
            const data = await response.json();
            const buffer = await generateChecklistXLSX(data.readings || [], room);
            
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement("a");
            const blobUrl = URL.createObjectURL(blob);
            link.setAttribute("href", blobUrl);
            link.setAttribute("download", `temperature-data-${room}-${startDate}-to-${endDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Failed to export data:", error);
        }
    };

    const grouped: Record<string, Record<string, number | null>> = {};
    readings.forEach(r => {
        const readingDate = new Date(r.timestamp);
        const date = readingDate.toISOString().split("T")[0];
        const hour = readingDate.getHours();

        if (!grouped[date]) {
            grouped[date] = Object.fromEntries(timeSlots.map(t => [t, null]));
        }

        const slotHour = Math.floor(hour / 2) * 2;
        const nearestSlot = `${slotHour.toString().padStart(2, "0")}:00`;

        if (timeSlots.includes(nearestSlot)) {
            grouped[date][nearestSlot] = r.temperature;
        }
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const handleRoomChange = (room: string) => {
        setSelectedRoom(room);
        setCurrentPage(1);
    };

    const dateDisplayOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dateRangeDisplay = `${startDate.toLocaleDateString(undefined, dateDisplayOptions)} - ${endDate.toLocaleDateString(undefined, dateDisplayOptions)}`;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="border-b border-gray-200">
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    <Download className="h-4 w-4" />
                    <span>Download Report</span>
                </button>
            </div>

            <div className="overflow-x-auto relative">
                {loading && (
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
                        {sortedDates.map(date => (
                            <tr key={date} className="hover:bg-gray-50">
                                <td className="border px-2 py-2">{date}</td>
                                {timeSlots.map(slot => (
                                    <td key={slot} className="border px-2 py-2">
                                        {grouped[date][slot] !== null ? `${grouped[date][slot]}°C` : "-"}
                                    </td>
                                ))}
                                <td className="border px-2 py-2"><input type="text" className="w-full p-1 border-none bg-transparent focus:ring-0"/></td>
                                <td className="border px-2 py-2"><input type="text" className="w-full p-1 border-none bg-transparent focus:ring-0"/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedDates.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        No data available for this room for the selected week.
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous Week
                </button>
                <div className="text-sm font-medium text-gray-700">
                    {dateRangeDisplay}
                </div>
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Week
                </button>
            </div>
            <ExportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Download Checklist Report">
                <ExportForm rooms={rooms} onExport={handleExport} onClose={() => setIsModalOpen(false)} />
            </ExportModal>
        </div>
    );
};

export default ChecklistTable;