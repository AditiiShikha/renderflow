const express = require('express');
const cors = require('cors');

const contextRoutes = require('./routes/context.routes');
const generateRoutes = require('./routes/generate.routes');
const { startSimulator } = require('./ingestion/simulator');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS must stay enabled for the React dev server's origin (Vite defaults to :5173).
app.use(cors());
app.use(express.json());

app.use('/api', contextRoutes);
app.use('/api', generateRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`RenderFlow backend listening on http://localhost:${PORT}`);

  startSimulator().catch((err) => {
    console.error('Failed to start telemetry simulator:', err);
  });
});

module.exports = app;
