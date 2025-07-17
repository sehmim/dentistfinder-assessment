import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

// Load the OpenAPI specification from YAML file
const loadSwaggerSpec = () => {
  try {
    const yamlPath = path.join(__dirname, '../../docs/api.yml');
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    return yaml.load(yamlContent) as any;
  } catch (error) {
    console.error('Failed to load API spec from YAML:', error);
    // Fallback minimal spec
    return {
      openapi: '3.0.0',
      info: {
        title: 'Appointment Sync API',
        version: '1.0.0',
        description: 'API documentation could not be loaded'
      },
      paths: {}
    };
  }
};

export const swaggerSpec = loadSwaggerSpec();