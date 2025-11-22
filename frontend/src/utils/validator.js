// Frontend validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateProjectId = (projectId) => {
  if (!projectId || typeof projectId !== 'string') return false;

  // Allow numeric IDs or path-like strings
  const projectIdRegex = /^(\d+|[\w\-/%]+)$/;
  return projectIdRegex.test(projectId);
};

export const validateRiskScore = (score) => {
  const num = parseFloat(score);
  return !isNaN(num) && num >= 0 && num <= 1;
};

export const validateAlertSeverity = (severity) => {
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  return validSeverities.includes(severity);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Basic sanitization - remove potentially dangerous characters
  return input.replace(/[<>'"&]/g, '');
};

export const formatRiskScore = (score) => {
  const num = parseFloat(score);
  if (isNaN(num)) return 'N/A';
  return `${(num * 100).toFixed(1)}%`;
};

export const getRiskLevel = (score) => {
  const num = parseFloat(score);
  if (isNaN(num)) return 'unknown';

  if (num >= 0.8) return 'critical';
  if (num >= 0.6) return 'high';
  if (num >= 0.4) return 'medium';
  return 'low';
};

export const getRiskColor = (score) => {
  const level = getRiskLevel(score);
  switch (level) {
    case 'critical': return '#ff4444';
    case 'high': return '#ff8844';
    case 'medium': return '#ffaa44';
    case 'low': return '#44aa88';
    default: return '#666666';
  }
};