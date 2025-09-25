# Data Room Temperature Monitor

A modern, scalable web application for monitoring temperature data in data rooms. This project uses a React frontend and is powered by a Google Apps Script backend that uses a Google Sheet as its database.

## Features

- **Secure Authentication**: User signup and login system.
- **Live Dashboard**: An overview of the latest temperature status for all monitored rooms.
- **Advanced Charting**: A filterable time-series chart to visualize temperature trends over various periods (24 hours, 7 days, 30 days).
- **Daily Checklist**: A unique checklist-style view of daily temperatures in 2-hour time slots, with weekly pagination.
- **Raw Data Table**: A paginated table to inspect individual temperature readings.
- **Rich Excel Reports**: A powerful report generation tool that downloads a styled `.xlsx` Excel file with a custom title, bolded headers, and color-coded data. Users can select any room and date range for their report.
- **Fully Responsive**: A clean, modern UI that works on any device.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Charting**: Chart.js with `chartjs-adapter-date-fns`
- **Excel Generation**: ExcelJS
- **Backend**: Google Apps Script
- **Database**: Google Sheets

## Project Setup

To get this project running, you need to set up both the Google Sheets backend and the React frontend.

### 1. Backend Setup (Google Sheet & Apps Script)

1.  **Create Google Sheet**: Create a new Google Sheet. The script will automatically create the necessary `users` and `temperatures` tabs.
2.  **Get Sheet ID**: Copy the ID of your sheet from its URL. The ID is the long string of characters between `/d/` and `/edit`.
    - `https://docs.google.com/spreadsheets/d/SHEET_ID_IS_HERE/edit`
3.  **Open Apps Script**: In your Google Sheet, go to `Extensions` > `Apps Script`.
4.  **Add Script Code**: Copy the entire content of `google-apps-script/main.gs` from this project and paste it into the Apps Script editor, replacing any boilerplate code.
5.  **Set Sheet ID**: In the script editor, replace the placeholder value of the `SHEET_ID` constant with the ID you copied in step 2.
6.  **Deploy as Web App**:
    - Click the **Deploy** button and select **New deployment**.
    - Click the gear icon next to "Select type" and choose **Web app**.
    - For "Execute as", select **Me**.
    - For "Who has access", select **Anyone** (this is necessary for the app to be able to call the script).
    - Click **Deploy**.
    - **Important**: Authorize the script's permissions when prompted.
    - Copy the **Web app URL** that is provided after deployment. You will need this for the frontend.

### 2. Frontend Setup (React)

1.  **Clone Repository**: Clone this project to your local machine.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Create Environment File**:
    - In the root of the project, create a new file named `.env`.
    - Add the Web App URL you copied from the backend deployment:
      ```
      VITE_SCRIPT_URL=YOUR_WEB_APP_URL_HERE
      ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
5.  **Access the Application**: Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## Project Structure

```
/home/rashid/Desktop/Project/DataRoom/
├───.gitignore
├───google-apps-script/
│   └───main.gs            # Backend logic
├───public/
├───src/
│   ├───components/         # React components
│   │   ├───Dashboard.tsx
│   │   ├───DataTable.tsx
│   │   ├───ChecklistTable.tsx
│   │   ├───TemperatureChart.tsx
│   │   ├───ExportModal.tsx
│   │   └───ExportForm.tsx
│   ├───context/
│   │   └───AuthContext.tsx
│   ├───App.tsx
│   └───main.tsx
├───package.json
├───README.md              # This file
└───vite.config.ts
```
