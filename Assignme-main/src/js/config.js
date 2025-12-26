/**
 * Configuration file for AssignMe application
 * Contains static configuration for different environments
 */

// Determine environment based on hostname
const host = window.location.hostname;
const isDevelopment = host === 'localhost' || host === '127.0.0.1';

// Static configuration based on environment
const config = {
  // Main API endpoint for processing assignments
  assignmentApiUrl: "https://test2-sfwm.onrender.com/process-file/",
  
  // Alternative/testing API endpoints
  alternativeApiUrl1: "https://assignment-api-vibhaw.onrender.com/process-file/",
  alternativeApiUrl2: "https://test-assingnement-api.onrender.com/process-file/",
  
  // Font generation API endpoint
  fontGenerationApiUrl: "https://ff-test-cr3w.onrender.com/generate-font",
  
  // Environment flag
  isDevelopment,
  
  // Add any additional configuration properties as needed
};

// Export the configuration object
export default config;
