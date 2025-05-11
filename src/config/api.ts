const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  GENERATE_APP: `${API_BASE_URL}/api/generate-app`,
  LOGS: (id: string) => `${API_BASE_URL}/api/logs/${id}`,
  BUILDS: `${API_BASE_URL}/api/builds`,
  DOWNLOAD: (filename: string) => `${API_BASE_URL}/api/download/${filename}`,
} as const; 