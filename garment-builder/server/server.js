const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
const VERSIONS_FILE = path.join(DATA_DIR, 'versions.json');

// Initialize data directory and file
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(VERSIONS_FILE);
    } catch {
      await fs.writeFile(VERSIONS_FILE, JSON.stringify({ versions: [] }));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Get all versions for a project (last 10, sorted by newest first)
app.get('/api/versions/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('API: Fetching versions for projectId:', projectId);
    const data = JSON.parse(await fs.readFile(VERSIONS_FILE, 'utf-8'));
    const projectVersions = data.versions
      .filter(v => v.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10); // Limit to last 10 versions
    console.log('API: Returning', projectVersions.length, 'versions for projectId:', projectId);
    res.json(projectVersions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Save a new version
app.post('/api/versions', async (req, res) => {
  try {
    const { projectId, image, designOptions, selectedFabrics, timestamp } = req.body;
    console.log('API: Saving new version for projectId:', projectId);
    
    const newVersion = {
      id: uuidv4(),
      projectId,
      image, // Base64 encoded image
      designOptions,
      selectedFabrics,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const data = JSON.parse(await fs.readFile(VERSIONS_FILE, 'utf-8'));
    data.versions.push(newVersion);
    await fs.writeFile(VERSIONS_FILE, JSON.stringify(data, null, 2));
    
    res.json(newVersion);
  } catch (error) {
    console.error('Error saving version:', error);
    res.status(500).json({ error: 'Failed to save version' });
  }
});

// Delete a version
app.delete('/api/versions/:versionId', async (req, res) => {
  try {
    const { versionId } = req.params;
    const data = JSON.parse(await fs.readFile(VERSIONS_FILE, 'utf-8'));
    data.versions = data.versions.filter(v => v.id !== versionId);
    await fs.writeFile(VERSIONS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting version:', error);
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

// Initialize and start server
initializeStorage().then(() => {
  app.listen(PORT, () => {
    console.log(`Design versions server running on port ${PORT}`);
  });
});