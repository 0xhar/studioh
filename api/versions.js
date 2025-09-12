const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data will be stored in /tmp for Vercel serverless functions
const DATA_DIR = '/tmp';
const VERSIONS_FILE = path.join(DATA_DIR, 'versions.json');

// Initialize data file
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

// Helper function to read versions
async function readVersions() {
  try {
    await initializeStorage();
    const data = await fs.readFile(VERSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading versions:', error);
    return { versions: [] };
  }
}

// Helper function to write versions
async function writeVersions(data) {
  try {
    await fs.writeFile(VERSIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing versions:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;

  try {
    switch (method) {
      case 'GET': {
        const { projectId } = query;
        const data = await readVersions();
        
        if (projectId) {
          const projectVersions = data.versions.filter(v => v.projectId === projectId);
          // Return last 10 versions, most recent first
          const recentVersions = projectVersions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
          res.json({ versions: recentVersions });
        } else {
          res.json(data);
        }
        break;
      }

      case 'POST': {
        const { projectId, imageUrl, designOptions, selectedFabrics } = req.body;
        
        if (!projectId || !imageUrl) {
          return res.status(400).json({ error: 'ProjectId and imageUrl are required' });
        }

        const data = await readVersions();
        const newVersion = {
          id: uuidv4(),
          projectId,
          imageUrl,
          designOptions: designOptions || {},
          selectedFabrics: selectedFabrics || {},
          createdAt: new Date().toISOString()
        };

        data.versions.push(newVersion);
        await writeVersions(data);

        console.log(`Saved version ${newVersion.id} for project ${projectId}`);
        res.status(201).json(newVersion);
        break;
      }

      case 'DELETE': {
        const { versionId } = query;
        
        if (!versionId) {
          return res.status(400).json({ error: 'VersionId is required' });
        }

        const data = await readVersions();
        const initialLength = data.versions.length;
        data.versions = data.versions.filter(v => v.id !== versionId);

        if (data.versions.length === initialLength) {
          return res.status(404).json({ error: 'Version not found' });
        }

        await writeVersions(data);
        console.log(`Deleted version ${versionId}`);
        res.json({ success: true });
        break;
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};