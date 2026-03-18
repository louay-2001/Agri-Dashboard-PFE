const express = require('express');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Helper function to format timestamps
const getFormattedTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${getFormattedTimestamp()}] Incoming Request: ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', req.body);
  }
  next();
});

// Route to handle temperature and humidity data
app.post('/send-data', (req, res) => {
  const { temperature, humidity } = req.body;

  if (temperature !== undefined && humidity !== undefined) {
    const timestamp = getFormattedTimestamp();
    console.log(`[${timestamp}] Received data: Temperature = ${temperature}, Humidity = ${humidity}`);
    res.status(200).send({
      status: 'Data received',
      received: { temperature, humidity, timestamp },
    });
  } else {
    res.status(400).send({ status: 'Invalid data', error: 'Temperature or humidity missing' });
  }
});

// Start the server
const PORT = 3001; // Use a different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`[${getFormattedTimestamp()}] Test server running on http://localhost:${PORT}`);
});