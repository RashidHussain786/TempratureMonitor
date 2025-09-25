/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Replace with your Google Sheet ID
const SHEET_ID = '1PBYk9-Rr1JHdRiosNknHYYvEbHmUiW0HoGHrmu5RajI';

function hashPassword(password) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return digest.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    if (name === 'users') {
      sheet.appendRow(['username', 'password', 'role']);
    } else if (name === 'temperatures') {
      sheet.appendRow(['id', 'roomId', 'temperature', 'timestamp', 'status']);
    }
  }
  return sheet;
}

function getTemperatureReadings(filters = {}) {
  const { roomId, startDate, endDate } = filters;
  const sheet = getSheet('temperatures');
  const allData = sheet.getDataRange().getValues();
  const headers = allData.shift(); // Remove header row

  let filteredData = allData;

  // Apply filters
  if (roomId && roomId !== 'all') {
    filteredData = filteredData.filter(row => row[1] === roomId);
  }
  if (startDate) {
    filteredData = filteredData.filter(row => new Date(row[3]) >= new Date(startDate));
  }
  if (endDate) {
    filteredData = filteredData.filter(row => new Date(row[3]) <= new Date(endDate));
  }

  // Map to object format
  return filteredData.map(row => {
    let status = 'normal';
    if (row[2] > 24) status = 'hot';
    else if (row[2] < 18) status = 'cold';
    return {
      id: row[0],
      roomId: row[1],
      temperature: row[2],
      timestamp: row[3],
      status: status
    };
  });
}

function doGet(e) {
  
  const path = e.parameter.path;
  
  if (path === 'v2-dashboard-summary') {
    const tempSheet = getSheet('temperatures');
    const data = tempSheet.getDataRange().getValues();
    data.shift(); // remove headers

    const latestReadings = {};
    data.forEach(row => {
        const roomId = row[1];
        const timestamp = new Date(row[3]);

        if (!latestReadings[roomId] || timestamp > new Date(latestReadings[roomId][3])) {
            latestReadings[roomId] = row;
        }
    });

    const rooms = ['B206', 'B207', 'B208', 'B209', 'B210', 'Tent-2', 'Tent-3']; // hardcoded
    const roomSummaries = rooms.map(roomId => {
        const latestReading = latestReadings[roomId];
        let status = 'normal';
        if (latestReading && latestReading[2] > 24) status = 'hot';
        else if (latestReading && latestReading[2] < 18) status = 'cold';

        return {
            roomId,
            currentTemp: latestReading ? latestReading[2] : null,
            status: latestReading ? status : 'no_data',
            lastUpdate: latestReading ? latestReading[3] : null
        };
    });

    const totalReadings = tempSheet.getLastRow() - 1;

    return ContentService.createTextOutput(JSON.stringify({
        rooms: roomSummaries,
        totalReadings: totalReadings,
        lastSystemUpdate: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } else if (path === 'dashboard-summary') {
    const tempSheet = getSheet('temperatures');
    const data = tempSheet.getDataRange().getValues();
    const rooms = ['B206', 'B207', 'B208', 'B209', 'B210', 'Tent-2', 'Tent-3'];
    const roomSummaries = rooms.map(roomId => {
      const roomReadings = data.filter(row => row[1] === roomId);
      const latestReading = roomReadings[roomReadings.length - 1];
      let status = 'normal';
      if (latestReading && latestReading[2] > 24) status = 'hot';
      else if (latestReading && latestReading[2] < 18) status = 'cold';
      
      return {
        roomId,
        currentTemp: latestReading ? latestReading[2] : null,
        status: latestReading ? status : 'no_data',
        lastUpdate: latestReading ? latestReading[3] : null
      };
    });

    return ContentService.createTextOutput(JSON.stringify({ rooms: roomSummaries, totalReadings: data.length - 1, lastSystemUpdate: new Date().toISOString() })).setMimeType(ContentService.MimeType.JSON);
  } else if (path === 'v2-temperature-data') {
    const { roomId, startDate, endDate, offset = '0', limit } = e.parameter;

    const filters = { roomId, startDate, endDate };
    const allFilteredReadings = getTemperatureReadings(filters);

    const totalCount = allFilteredReadings.length;

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = limit ? startIndex + parseInt(limit) : totalCount;
    const paginatedReadings = allFilteredReadings.slice(startIndex, endIndex);

    return ContentService.createTextOutput(JSON.stringify({
        readings: paginatedReadings,
        totalCount: totalCount
    })).setMimeType(ContentService.MimeType.JSON);
  } else if (path === 'temperature-data') {
    const tempSheet = getSheet('temperatures');
    const offset = parseInt(e.parameter.offset || '0');
    const limit = parseInt(e.parameter.limit || '3'); // Default limit

    const lastRow = tempSheet.getLastRow();
    const totalCount = lastRow > 1 ? lastRow - 1 : 0; // Exclude header row

    let readings = [];
    if (totalCount > 0) {
      // Data starts from row 2 (after header)
      const startRow = 2 + offset;
      const numRows = Math.min(limit, totalCount - offset);

      if (numRows > 0) {
        const data = tempSheet.getRange(startRow, 1, numRows, 5).getValues();
        readings = data.map(row => {
          let status = 'normal';
          if (row[2] > 24) status = 'hot';
          else if (row[2] < 18) status = 'cold';
          return {
            id: row[0],
            roomId: row[1],
            temperature: row[2],
            timestamp: row[3],
            status: status
          };
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ readings, totalCount })).setMimeType(ContentService.MimeType.JSON);
  } else if (path === 'rooms') {
    const rooms = ['B206', 'B207', 'B208', 'B209', 'B210', 'Tent-2', 'Tent-3'];
    return ContentService.createTextOutput(JSON.stringify({ rooms })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput('Invalid path').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const path = e.parameter.path;
  const contents = JSON.parse(e.postData.contents);

  if (path === 'login') {
    const { username, password } = contents;
    const hashedPassword = hashPassword(password);
    const userSheet = getSheet('users');
    const users = userSheet.getDataRange().getValues();
    for (let i = 1; i < users.length; i++) {
      if (users[i][0] === username && users[i][1] === hashedPassword) {
        // Simple token, in a real app, use something more secure
        const token = `fake-token-for-${username}`;
        return ContentService.createTextOutput(JSON.stringify({ token, user: { username, role: users[i][2] } })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid credentials' })).setMimeType(ContentService.MimeType.JSON);
  } else if (path === 'signup') {
    const { username, password } = contents;
    const hashedPassword = hashPassword(password);
    const userSheet = getSheet('users');
    const users = userSheet.getDataRange().getValues();
    for (let i = 1; i < users.length; i++) {
      if (users[i][0].toLowerCase() === username.toLowerCase()) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'User already exists' })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    userSheet.appendRow([username, hashedPassword, 'user']);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } else if (path === 'temperature-readings') {
    const { readings } = contents;
    const tempSheet = getSheet('temperatures');
    const timestamp = new Date().toISOString();
    readings.forEach(reading => {
      tempSheet.appendRow([
        new Date().getTime(), // simple id
        reading.roomId,
        reading.temperature,
        timestamp,
        'normal'
      ]);
    });
    return ContentService.createTextOutput(JSON.stringify({ message: 'Temperature readings added successfully' })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput('Invalid path').setMimeType(ContentService.MimeType.JSON);
}
