import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  console.log('Serving static files from:', distPath);
  app.use(express.static(distPath));
}

// Temperature data storage
let temperatureLog = [];
let currentTemperature = 28.5;

// Simulate temperature readings
function generateTemperature() {
  // Simulate more realistic temperature fluctuations
  const variation = (Math.random() - 0.5) * 2; // -1 to +1 degree variation
  const trend = Math.sin(Date.now() / 60000) * 3; // Slow sine wave trend
  
  currentTemperature = Math.max(20, Math.min(45, 
    currentTemperature + variation + trend * 0.1
  ));
  
  const temperatureReading = {
    temperature: parseFloat(currentTemperature.toFixed(1)),
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  // Store in log (keep last 100 readings)
  temperatureLog.push(temperatureReading);
  if (temperatureLog.length > 100) {
    temperatureLog.shift();
  }
  
  return temperatureReading;
}

// Broadcast temperature to all connected WebSocket clients
function broadcastTemperature() {
  const reading = generateTemperature();
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'temperature',
        data: reading
      }));
    }
  });
  
  console.log(`Temperature: ${reading.temperature}°C at ${reading.timestamp}`);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send current temperature and recent history to new client
  ws.send(JSON.stringify({
    type: 'initial',
    data: {
      current: currentTemperature,
      history: temperatureLog.slice(-20) // Last 20 readings
    }
  }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// REST API Endpoints
app.get('/api/temperature', (req, res) => {
  res.json({
    current: currentTemperature,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/temperature/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(temperatureLog.slice(-limit));
});

// CSV Export endpoint
app.get('/api/temperature/export', (req, res) => {
  const csvHeader = 'Timestamp,Temperature (°C)\n';
  const csvData = temperatureLog
    .map(reading => `${reading.timestamp},${reading.temperature}`)
    .join('\n');
  
  const csv = csvHeader + csvData;
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=temperature-log.csv');
  res.send(csv);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    readings: temperatureLog.length 
  });
});

// Serve the React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
  });
}

// Start temperature simulation (every 5 seconds)
const temperatureInterval = setInterval(broadcastTemperature, 5000);

// Generate initial reading
generateTemperature();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌡️  Smart Temperature Logger Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for real-time connections`);
  console.log(`📈 Temperature simulation started (every 5 seconds)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Log the dist directory path for debugging
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../dist');
    console.log(`📁 Static files directory: ${distPath}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(temperatureInterval);
  server.close();
});
