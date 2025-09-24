# Temperature Monitoring System

A secure web application for monitoring temperature data in data rooms with JSON file storage and admin authentication.

## Features

- **Secure Authentication**: Admin login with JWT tokens and session management
- **Real-time Monitoring**: Track temperature data for 5 data rooms (B206-B210)
- **Automated Data Collection**: Temperature readings recorded every 2 hours
- **JSON File Storage**: Secure file-based data storage without database dependency
- **Interactive Dashboard**: Real-time charts, tables, and room status cards
- **Data Export**: CSV export functionality for temperature data
- **Responsive Design**: Mobile-friendly interface with modern UI

## Security Features

- JWT-based authentication with secure token management
- Rate limiting for API endpoints and login attempts
- Helmet.js for security headers
- bcrypt password hashing
- Session management with secure cookies
- Protected JSON data files with proper access controls

## Installation & Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```
   This will start both the Express server (port 3001) and React client (port 5173).

3. **Access the application**:
   - Open http://localhost:5173 in your browser
   - Use default admin credentials:
     - Username: `admin`
     - Password: `admin123`

## Project Structure

```
├── server.js              # Express server with API endpoints
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.tsx   # Main dashboard component
│   │   ├── LoginForm.tsx   # Authentication form
│   │   ├── TemperatureCard.tsx  # Room temperature cards
│   │   ├── TemperatureChart.tsx # Data visualization charts
│   │   └── DataTable.tsx   # Raw data table with export
│   ├── context/
│   │   └── AuthContext.tsx # Authentication context
│   └── App.tsx            # Main application component
├── data/                  # JSON data storage (auto-created)
│   ├── users.json         # User credentials
│   └── temperature_data.json # Temperature readings
└── README.md
```

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/dashboard-summary` - Dashboard overview data
- `GET /api/temperature-data` - Temperature readings with filtering
- `GET /api/rooms` - Available room list

## Data Schema

### Temperature Reading
```json
{
  "id": "unique-id",
  "roomId": "B206",
  "temperature": 22.5,
  "timestamp": "2025-01-11T10:00:00.000Z",
  "status": "normal"
}
```

### User Authentication
```json
{
  "id": 1,
  "username": "admin",
  "password": "hashed-password",
  "role": "admin"
}
```

## Deployment Considerations

1. **Environment Variables**: Set secure values for:
   - `JWT_SECRET` - JWT signing secret
   - `NODE_ENV` - Set to 'production'

2. **HTTPS**: Enable HTTPS in production and update session cookies accordingly

3. **Data Backup**: Implement regular backup of JSON data files

4. **Monitoring**: Set up logging and monitoring for production use

## Development Features

- Hot reload for both client and server
- Development temperature generation (every minute for testing)
- Demo credentials included for easy testing
- Comprehensive error handling and loading states

## Security Notes

- Default credentials should be changed in production
- JWT secret must be updated for production use
- Rate limiting is implemented for security
- All API endpoints require authentication
- JSON files are stored securely on the server filesystem

This system provides a complete solution for temperature monitoring with enterprise-level security and a modern, responsive interface.