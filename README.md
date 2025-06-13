# Smart Temperature Logger

A full-stack real-time temperature monitoring application with intelligent alerts, built with React, Node.js, and WebSockets.

## Features

- **Real-time Temperature Monitoring**: Live temperature readings updated every 5 seconds
- **Interactive Charts**: Visual temperature trends with custom canvas-based charts
- **Smart Alerts**: Automatic notifications when temperature exceeds 35°C
- **Data Export**: Download temperature logs as CSV files
- **Responsive Design**: Beautiful UI that works on all devices
- **WebSocket Connection**: Real-time data streaming with automatic reconnection

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, WebSocket (ws)
- **Icons**: Lucide React
- **Deployment**: Render (full-stack)

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the full application (frontend + backend):
```bash
npm run full
```

3. Or run components separately:
```bash
# Backend only
npm run server

# Frontend only
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Deployment

This application is configured for deployment on Render using the included `render.yaml` configuration.

### Deploy to Render:

1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` file
3. The application will build and deploy automatically

The deployment includes:
- Automatic builds with `npm run build`
- Static file serving for the React frontend
- WebSocket and API endpoints on the same domain
- Environment variable configuration

## API Endpoints

- `GET /api/temperature` - Get current temperature
- `GET /api/temperature/history?limit=50` - Get temperature history
- `GET /api/temperature/export` - Download CSV export
- `GET /api/health` - Health check endpoint
- `WebSocket /` - Real-time temperature updates

## Environment Variables

- `NODE_ENV` - Set to 'production' for production builds
- `PORT` - Server port (automatically set by Render)

## License

MIT License
