// Utility function to get consistent project ID
export const getProjectId = () => {
  // Get from URL path or use default
  const pathSegments = window.location.pathname.split('/').filter(segment => segment);
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  console.log('getProjectId: URL pathname:', window.location.pathname);
  console.log('getProjectId: pathSegments:', pathSegments);
  console.log('getProjectId: lastSegment:', lastSegment);
  
  // If it's a valid project ID (not empty, not 'design', etc.)
  if (lastSegment && lastSegment !== 'design' && lastSegment !== '') {
    console.log('getProjectId: Using lastSegment:', lastSegment);
    return lastSegment;
  }
  
  console.log('getProjectId: Using default');
  return 'default';
};