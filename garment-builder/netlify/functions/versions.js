const { v4: uuidv4 } = require('uuid');

// In-memory storage for Netlify Functions (will reset on each deploy)
// For production, use a database service like Supabase, Fauna, or MongoDB Atlas
let versionsData = {
  versions: []
};

exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/versions', '');
  const method = event.httpMethod;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // GET /api/versions or /api/versions?projectId=xxx
    if (method === 'GET') {
      const projectId = event.queryStringParameters?.projectId;
      
      if (projectId) {
        const projectVersions = versionsData.versions
          .filter(v => v.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ versions: projectVersions })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(versionsData)
      };
    }

    // POST /api/versions
    if (method === 'POST') {
      const body = JSON.parse(event.body);
      const { projectId, image, designOptions, selectedFabrics, timestamp } = body;
      
      const newVersion = {
        id: uuidv4(),
        projectId,
        image,
        designOptions,
        selectedFabrics,
        timestamp: timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      versionsData.versions.push(newVersion);
      
      // Keep only last 100 versions total (to prevent memory issues)
      if (versionsData.versions.length > 100) {
        versionsData.versions = versionsData.versions
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 100);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(newVersion)
      };
    }

    // DELETE /api/versions?versionId=xxx
    if (method === 'DELETE') {
      const versionId = event.queryStringParameters?.versionId;
      
      if (!versionId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'versionId is required' })
        };
      }
      
      const index = versionsData.versions.findIndex(v => v.id === versionId);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Version not found' })
        };
      }
      
      versionsData.versions.splice(index, 1);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Version deleted successfully' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};