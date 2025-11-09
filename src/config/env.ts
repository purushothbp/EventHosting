// Environment configuration
export const config = {
  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/eventhosting-dev',
  
  // App environment
  nodeEnv: process.env.NEXT_NODE_ENV || 'development',
  isProduction: process.env.NEXT_NODE_ENV === 'production',
  isDevelopment: process.env.NEXT_NODE_ENV !== 'production',
  
  // Add other environment variables here
  // Example:
  // apiUrl: process.env.NEXT_API_URL || 'http://localhost:3000/api',
} as const;

// Type for the config object
type Config = typeof config;

// Validate required environment variables in production
if (config.isProduction) {
  const requiredEnvVars = [
    'MONGO_URI',
    // Add other required production environment variables here
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export type { Config };
