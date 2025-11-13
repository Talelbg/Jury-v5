// backend/server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// --- Instructions ---
// To run this backend server:
// 1. Navigate to the `backend` directory in your terminal.
// 2. Run `npm install` to install the required dependencies (express, cors, ws).
// 3. Run `node server.js` to start the server.
// The server will run on http://localhost:3001 and the frontend will connect to it.

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Create HTTP server and WebSocket server ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- WebSocket Logic ---
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// --- DB Utility Functions ---

const readDB = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
        console.error("db.json not found. Please ensure it exists in the backend directory.");
        return { projects: [], judges: [], criteria: [], scores: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database file:", error);
    return { projects: [], judges: [], criteria: [], scores: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
};

// --- Broadcast Helper ---
const broadcastUpdate = () => {
    broadcast({ type: 'DATA_UPDATE', payload: readDB() });
};

// --- API Routes ---

// GET all data
app.get('/api/data', (req, res) => {
  const db = readDB();
  res.json(db);
});

// PROJECTS
app.post('/api/projects', (req, res) => {
  const db = readDB();
  const newProjectsData = req.body; // Expects an array
  const createdProjects = newProjectsData.map((p, i) => ({ ...p, id: `p_${Date.now()}_${i}` }));
  db.projects.push(...createdProjects);
  writeDB(db);
  broadcastUpdate();
  res.status(201).json(createdProjects);
});

app.put('/api/projects/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const updatedProject = req.body;
  const index = db.projects.findIndex(p => p.id === id);
  if (index !== -1) {
    db.projects[index] = updatedProject;
    writeDB(db);
    broadcastUpdate();
    res.json(updatedProject);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const projectExists = db.projects.some(p => p.id === id);
  if (projectExists) {
    db.projects = db.projects.filter(p => p.id !== id);
    // Cascade delete scores
    db.scores = db.scores.filter(s => s.projectId !== id);
    writeDB(db);
    broadcastUpdate();
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
});

// JUDGES
app.post('/api/judges', (req, res) => {
    const db = readDB();
    const newJudgeData = req.body;
    const newJudge = { id: `j_${Date.now()}`, ...newJudgeData };
    db.judges.push(newJudge);
    writeDB(db);
    broadcastUpdate();
    res.status(201).json(newJudge);
});

app.put('/api/judges/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;
    const updatedJudge = req.body;
    const index = db.judges.findIndex(j => j.id === id);
    if (index !== -1) {
        db.judges[index] = updatedJudge;
        writeDB(db);
        broadcastUpdate();
        res.json(updatedJudge);
    } else {
        res.status(404).json({ message: 'Judge not found' });
    }
});

app.delete('/api/judges/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;
    const judgeExists = db.judges.some(j => j.id === id);
    if (judgeExists) {
        db.judges = db.judges.filter(j => j.id !== id);
        // Cascade delete scores
        db.scores = db.scores.filter(s => s.judgeId !== id);
        writeDB(db);
        broadcastUpdate();
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ message: 'Judge not found' });
    }
});

// CRITERIA
app.post('/api/criteria', (req, res) => {
    const db = readDB();
    const newCriterionData = req.body;
    const newCriterion = { id: `c_${Date.now()}`, ...newCriterionData };
    db.criteria.push(newCriterion);
    writeDB(db);
    broadcastUpdate();
    res.status(201).json(newCriterion);
});

app.put('/api/criteria/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;
    const updatedCriterion = req.body;
    const index = db.criteria.findIndex(c => c.id === id);
    if (index !== -1) {
        db.criteria[index] = updatedCriterion;
        writeDB(db);
        broadcastUpdate();
        res.json(updatedCriterion);
    } else {
        res.status(404).json({ message: 'Criterion not found' });
    }
});

app.delete('/api/criteria/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;
    const criterionExists = db.criteria.some(c => c.id === id);
    if (criterionExists) {
        db.criteria = db.criteria.filter(c => c.id !== id);
        writeDB(db);
        broadcastUpdate();
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ message: 'Criterion not found' });
    }
});

// SCORES
app.post('/api/scores', (req, res) => { // Handles upsert
    const db = readDB();
    const score = req.body;
    const index = db.scores.findIndex(s => s.id === score.id);
    if (index !== -1) {
        db.scores[index] = score; // Update
    } else {
        db.scores.push(score); // Create
    }
    writeDB(db);
    broadcastUpdate();
    res.status(200).json(score);
});

app.delete('/api/scores/:id', (req, res) => {
    const db = readDB();
    const { id } = req.params;
    const scoreExists = db.scores.some(s => s.id === id);
    if (scoreExists) {
        db.scores = db.scores.filter(s => s.id !== id);
        writeDB(db);
        broadcastUpdate();
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ message: 'Score not found' });
    }
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Backend server with WebSocket is running on http://localhost:${PORT}`);
  console.log('API endpoints are available under /api');
});
