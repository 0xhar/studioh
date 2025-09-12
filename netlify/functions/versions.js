const { v4: uuidv4 } = require('uuid');

// Simple in-memory storage for demo (in production, use external database)
let versions = [];

exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters, body } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    switch (httpMethod) {
      case 'GET': {
        const projectId = queryStringParameters?.projectId;
        
        if (projectId) {
          const projectVersions = versions.filter(v => v.projectId === projectId);
          // Return last 10 versions, most recent first
          const recentVersions = projectVersions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ versions: recentVersions }),
          };
        } else {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ versions }),
          };
        }
      }

      case 'POST': {
        const data = JSON.parse(body);
        const { projectId, imageUrl, designOptions, selectedFabrics } = data;
        
        if (!projectId || !imageUrl) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ProjectId and imageUrl are required' }),
          };
        }

        const newVersion = {
          id: uuidv4(),
          projectId,
          imageUrl,
          designOptions: designOptions || {},
          selectedFabrics: selectedFabrics || {},
          createdAt: new Date().toISOString()
        };

        versions.push(newVersion);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newVersion),
        };
      }

      case 'DELETE': {
        const versionId = queryStringParameters?.versionId;
        
        if (!versionId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'VersionId is required' }),
          };
        }

        const initialLength = versions.length;
        versions = versions.filter(v => v.id !== versionId);

        if (versions.length === initialLength) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Version not found' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: `Method ${httpMethod} Not Allowed` }),
        };
    }
  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};