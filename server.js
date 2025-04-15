const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models'); // Sequelize connection
const fileRoutes = require('./routes/fileroute'); // The router you made

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/files', fileRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('CAD Block Viewer Backend is Live!');
});

// Sync Database and Start Server
sequelize.sync({ force: false }) // set to true to reset DB on each run
  .then(() => {
    console.log('✅ Connected to PostgreSQL & Models synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Unable to connect to DB:', err.message);
  });
