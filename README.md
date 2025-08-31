# Weather Dashboard

A modern, responsive weather dashboard that displays current weather conditions, 7-day forecasts, and maintains historical weather data using the Open-Meteo API.

## Features

- 🌤️ **Current Weather**: Real-time weather data for any location
- 📅 **7-Day Forecast**: Extended weather predictions
- 🗄️ **Historical Data**: MongoDB storage for weather history
- 🔍 **Location Search**: Search cities worldwide with autocomplete
- 📍 **Geolocation**: Get weather for your current location
- 📊 **Statistics**: View database statistics and trends
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Docker container)
- **Weather API**: Open-Meteo (free, no API key required)

## Prerequisites

- Node.js (v16 or higher)
- Docker (for MongoDB)
- WSL (if using Windows)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start MongoDB with Docker Compose:**
   ```bash
   docker-compose up -d mongodb
   ```

2. **Install dependencies and start servers:**
   ```bash
   chmod +x setup.sh start.sh
   ./setup.sh
   ./start.sh
   ```

### Option 2: Manual Setup

1. **Start MongoDB container manually:**
   ```bash
   docker run -d \
     --name weather-mongodb \
     -p 27017:27017 \
     -v $(pwd)/mongodb/data:/data/db \
     mongo:latest
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Start the application:**
   ```bash
   ./start.sh
   ```

## Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Search for a location** using the search bar or click "Current Location" to use your GPS coordinates

3. **View current weather** including temperature, humidity, wind speed, and conditions

4. **Check the 7-day forecast** with daily highs, lows, and precipitation

5. **Browse historical data** to see previously searched locations and their weather data

6. **View statistics** showing database insights like total records and temperature averages

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/weather/current/:lat/:lon` - Get current weather and forecast
- `GET /api/weather/history` - Get historical weather data
- `GET /api/locations/search/:query` - Search for locations
- `GET /api/weather/stats` - Get database statistics

## Environment Variables

You can customize the MongoDB connection using environment variables:

```bash
export MONGODB_URI=mongodb://localhost:27017/weatherdb
export PORT=5000  # Backend port
```

## File Structure

```
EmbbedSys/
├── backend/
│   ├── be.js              # Express server and API routes
│   ├── package.json       # Backend dependencies
│   └── node_modules/      # Installed packages
├── frontend/
│   ├── fe.js              # Frontend server
│   ├── package.json       # Frontend dependencies
│   ├── public/
│   │   └── index.html     # Main dashboard page
│   └── node_modules/      # Installed packages
├── mongodb/
│   └── data/              # MongoDB data directory
├── docker-compose.yml     # Docker Compose configuration
├── setup.sh              # Setup script
├── start.sh              # Startup script
└── README.md             # This file
```

## Development

### Running in Development Mode

For development with auto-restart on file changes:

1. **Install nodemon globally:**
   ```bash
   npm install -g nodemon
   ```

2. **Start backend in dev mode:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend in dev mode:**
   ```bash
   cd frontend
   npm run dev
   ```

### Adding New Features

The application is designed to be easily extensible:

- **Weather data model**: Modify the schema in `backend/be.js`
- **UI components**: Update `frontend/public/index.html`
- **API endpoints**: Add new routes in `backend/be.js`
- **Styling**: Modify the CSS in the `<style>` section of `index.html`

## Deployment

### For Local Development
The application is configured to run on localhost with ports 3000 (frontend) and 5000 (backend).

### For Production Deployment
When ready to deploy to a free web hosting provider:

1. **Update API URLs** in the frontend to point to your production backend
2. **Set environment variables** for your production MongoDB instance
3. **Build and deploy** both frontend and backend to your hosting platform

Popular free hosting options:
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Railway, Render, Fly.io
- **Database**: MongoDB Atlas (free tier)

## Troubleshooting

### Common Issues

1. **MongoDB connection errors:**
   - Ensure Docker is running
   - Check if MongoDB container is started: `docker ps`
   - Restart container: `docker restart weather-mongodb`

2. **Port already in use:**
   - Kill existing processes: `./start.sh` will handle this automatically
   - Or manually: `lsof -ti:3000 | xargs kill -9`

3. **API request failures:**
   - Check internet connection
   - Verify backend is running on port 5000
   - Check browser console for errors

### Logs

- **View container logs:** `docker logs weather-mongodb`
- **Backend logs:** Check terminal where backend is running
- **Frontend logs:** Check browser developer console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Open-Meteo**: Free weather API service
- **MongoDB**: Document database
- **Font Awesome**: Icons used in the UI
