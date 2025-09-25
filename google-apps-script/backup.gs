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

// ID of the separate Google Sheet document where backups will be stored.
const BACKUP_SHEET_ID = '1PBYk9-Rr1JHdRiosNknHYYvEbHmUiW0HoGHrmu5RajI';

/**
 * A time-driven function that backs up yesterday's temperature data to a separate spreadsheet.
 */
function backupDailyData() {
  // 1. Get the source data from the primary spreadsheet
  const sourceSheet = getSheet('temperatures'); // getSheet is in main.gs
  if (sourceSheet.getLastRow() <= 1) {
    console.log('No data to back up.');
    return;
  }
  const allData = sourceSheet.getDataRange().getValues();
  const headers = allData.shift(); // Remove header row

  // 2. Filter for yesterday's data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayData = allData.filter(row => {
    const rowDate = new Date(row[3]); // Timestamp is in column 4 (index 3)
    return rowDate >= yesterday && rowDate < today;
  });

  if (yesterdayData.length === 0) {
    console.log('No data from yesterday to back up.');
    return;
  }

  // 3. Open the backup spreadsheet and sheet
  let backupSpreadsheet;
  try {
    backupSpreadsheet = SpreadsheetApp.openById(BACKUP_SHEET_ID);
  } catch (e) {
    console.error(`Failed to open backup spreadsheet with ID ${BACKUP_SHEET_ID}. Please ensure the ID is correct and you have access.`);
    return;
  }

  const archiveSheetName = 'archive';
  let archiveSheet = backupSpreadsheet.getSheetByName(archiveSheetName);
  if (!archiveSheet) {
    archiveSheet = backupSpreadsheet.insertSheet(archiveSheetName);
    archiveSheet.appendRow(headers); // Add headers if the sheet is new
  }

  // 4. Append the filtered data to the archive sheet
  const startRow = archiveSheet.getLastRow() + 1;
  archiveSheet.getRange(startRow, 1, yesterdayData.length, yesterdayData[0].length).setValues(yesterdayData);

  console.log(`Successfully backed up ${yesterdayData.length} rows to ${archiveSheetName} in spreadsheet ${BACKUP_SHEET_ID}.`);
}
