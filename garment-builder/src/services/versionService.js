const API_BASE_URL = 'http://localhost:3003/api';

// Save a new version
export const saveVersion = async (projectId, image, designOptions, selectedFabrics) => {
  try {
    const response = await fetch(`${API_BASE_URL}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        image,
        designOptions,
        selectedFabrics,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save version');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving version:', error);
    throw error;
  }
};

// Get all versions for a project
export const getVersions = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/versions/${projectId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch versions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw error;
  }
};

// Delete a version
export const deleteVersion = async (versionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/versions/${versionId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete version');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting version:', error);
    throw error;
  }
};