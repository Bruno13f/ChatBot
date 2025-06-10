require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const routes = require('./routes/routes');

const app = express();
app.use(express.json());

// Allow all CORS
app.use(cors());

app.use(express.static('public'));

connectDB();

app.get('/', (req, res) => {
  res.send('API is up 🚀');
});

app.use('/api', routes);

const PORT = process.env.BACKEND_PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}/api`));
