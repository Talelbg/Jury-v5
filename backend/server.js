// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Fatal: MONGODB_URI environment variable is not defined.');
}
const client = new MongoClient(MONGODB_URI);
let db;

async function connectDB() {
    if (db) return db;
    try {
        await client.connect();
        db = client.db(); // Use the default DB from the connection string
        console.log("Successfully connected to MongoDB.");
        return db;
    } catch (e) {
        console.error("Failed to connect to MongoDB", e);
        process.exit(1);
    }
}

// --- DB Utility ---
const transformDoc = (doc) => {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    // Scores have a client-generated string 'id', other collections use '_id'
    return { id: _id ? _id.toHexString() : rest.id, ...rest };
};


const getObjectId = (id) => {
    try {
        return new ObjectId(id);
    } catch (e) {
        return null;
    }
};

// --- API Routes ---

// GET all data
app.get('/api/data', async (req, res) => {
    try {
        const database = await connectDB();
        const projects = await database.collection('projects').find({}).toArray();
        const judges = await database.collection('judges').find({}).toArray();
        const criteria = await database.collection('criteria').find({}).toArray();
        const scores = await database.collection('scores').find({}).toArray();
        
        res.json({
            projects: projects.map(transformDoc),
            judges: judges.map(transformDoc),
            criteria: criteria.map(transformDoc),
            scores: scores,
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// PROJECTS
app.post('/api/projects', async (req, res) => {
    try {
        const database = await connectDB();
        const result = await database.collection('projects').insertMany(req.body);
        const newIds = Object.values(result.insertedIds);
        const createdProjects = await database.collection('projects').find({ _id: { $in: newIds } }).toArray();
        res.status(201).json(createdProjects.map(transformDoc));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    const objectId = getObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ message: 'Invalid ID format' });
    const { id, ...data } = req.body;
    try {
        const database = await connectDB();
        const result = await database.collection('projects').updateOne({ _id: objectId }, { $set: data });
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Project not found' });
        res.json(req.body);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const objectId = getObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ message: 'Invalid ID format' });
    try {
        const database = await connectDB();
        const result = await database.collection('projects').deleteOne({ _id: objectId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Project not found' });
        await database.collection('scores').deleteMany({ projectId: req.params.id });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// JUDGES
app.post('/api/judges', async (req, res) => {
    try {
        const database = await connectDB();
        const result = await database.collection('judges').insertOne(req.body);
        const newJudge = await database.collection('judges').findOne({ _id: result.insertedId });
        res.status(201).json(transformDoc(newJudge));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.put('/api/judges/:id', async (req, res) => {
    const objectId = getObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ message: 'Invalid ID format' });
    const { id, ...data } = req.body;
    try {
        const database = await connectDB();
        const result = await database.collection('judges').updateOne({ _id: objectId }, { $set: data });
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Judge not found' });
        res.json(req.body);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.delete('/api/judges/:id', async (req, res) => {
    const objectId = getObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ message: 'Invalid ID format' });
    try {
        const database = await connectDB();
        const result = await database.collection('judges').deleteOne({ _id: objectId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Judge not found' });
        await database.collection('scores').deleteMany({ judgeId: req.params.id });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// CRITERIA
app.post('/api/criteria', async (req, res) => {
    try {
        const database = await connectDB();
        const result = await database.collection('criteria').insertOne(req.body);
        const newCriterion = await database.collection('criteria').findOne({ _id: result.insertedId });
        res.status(201).json(transformDoc(newCriterion));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.put('/api/criteria/:id', async (req, res) => {
    const objectId = getObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ message: 'Invalid ID format' });
    const { id, ...data } = req.body;
    try {
        const database = await connectDB();
        const result = await database.collection('criteria').updateOne({ _id: objectId }, { $set: data });
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Criterion not found' });
        res.json(req.body);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.delete('/api/criteria/:id', async (req, res) => {
    const objectId = getObjectId(req.params.id);
    if (!objectId) return res.status(400).json({ message: 'Invalid ID format' });
    try {
        const database = await connectDB();
        const result = await database.collection('criteria').deleteOne({ _id: objectId });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Criterion not found' });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// SCORES
app.post('/api/scores', async (req, res) => { // Handles upsert
    const score = req.body;
    const { id, ...scoreData } = score;
    try {
        const database = await connectDB();
        await database.collection('scores').updateOne({ id: id }, { $set: scoreData }, { upsert: true });
        res.status(200).json(score);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

app.delete('/api/scores/:id', async (req, res) => {
    try {
        const database = await connectDB();
        const result = await database.collection('scores').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Score not found' });
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// --- Start Server ---
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log('API endpoints are available under /api');
});

// Export the app for serverless environments like Vercel
module.exports = app;
