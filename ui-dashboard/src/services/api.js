// Connect your React dashboard to the agent API
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchMetrics = async () => {
  const response = await fetch(`${API_BASE}/metrics`);
  return response.json();
};

export const fetchOptimizations = async () => {
  const response = await fetch(`${API_BASE}/optimizations`);
  return response.json();
};

export const applyOptimization = async (optimizationId) => {
  const response = await fetch(`${API_BASE}/optimizations/${optimizationId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};