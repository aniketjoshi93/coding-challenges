const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const shortid = require('shortid');

const app = express();
const port = 8080;

// Create Redis client and connect
const client = redis.createClient();

client.connect().then(() => {
  console.log('Connected to Redis...');
}).catch((err) => {
  console.error('Could not connect to Redis:', err);
  process.exit(1);  // Exit if connection fails
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST endpoint to shorten a URL
app.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing field: url' });
  }

  try {
    // Check if the URL already exists in Redis
    const existingShortUrl = await client.get(url);
    if (existingShortUrl) {
      return res.status(200).json({
        key: existingShortUrl,
        long_url: url,
        short_url: `http://localhost/${existingShortUrl}`
      });
    }

    // Generate a short key and store it in Redis
    const shortKey = shortid.generate();
    await client.set(shortKey, url);  // Map short URL to long URL
    await client.set(url, shortKey);  // Map long URL to short URL

    res.status(201).json({
      key: shortKey,
      long_url: url,
      short_url: `http://localhost/${shortKey}`
    });
  } catch (err) {
    console.error('Redis operation error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
