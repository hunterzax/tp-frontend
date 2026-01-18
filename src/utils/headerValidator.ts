/**
 * CWE-644 Fix: HTTP Header Injection Prevention
 * Utility functions to validate and sanitize HTTP header values
 */

/**
 * Sanitize header value by removing CRLF characters and other potentially dangerous characters
 * @param value - The header value to sanitize
 * @returns Sanitized header value
 */
export function sanitizeHeaderValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }
  
  // Remove carriage return (CR), line feed (LF), and null bytes
  // These characters can be used for HTTP header injection attacks
  return value
    .replace(/[\r\n\0]/g, '')
    .trim();
}

/**
 * Validate Bearer token format
 * @param token - The token to validate
 * @returns True if token format is valid
 */
export function isValidBearerToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Remove potential CRLF
  const sanitized = sanitizeHeaderValue(token);
  
  // Check if sanitized token differs from original (potential injection attempt)
  if (sanitized !== token) {
    return false;
  }
  
  // Basic validation: token should not be empty after sanitization
  // and should not contain spaces (which could indicate multiple headers)
  if (sanitized.length === 0 || sanitized.includes(' ')) {
    return false;
  }
  
  // Token should be alphanumeric with allowed characters (., -, _, ~)
  // This is a general JWT/token pattern
  const tokenPattern = /^[A-Za-z0-9\-_\.~]+$/;
  return tokenPattern.test(sanitized);
}

/**
 * Safely construct Authorization header value
 * @param token - The bearer token
 * @returns Safe Authorization header value or null if invalid
 */
export function buildSafeAuthHeader(token: string): string | null {
  if (!isValidBearerToken(token)) {
    return null;
  }
  
  const sanitized = sanitizeHeaderValue(token);
  return `Bearer ${sanitized}`;
}

/**
 * Validate and sanitize Content-Type header
 * @param contentType - The content type value
 * @returns Sanitized content type or default
 */
export function sanitizeContentType(contentType: string): string {
  const sanitized = sanitizeHeaderValue(contentType);
  
  // Whitelist common content types
  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain',
    'text/html',
    'application/xml',
    'application/pdf',
    'application/octet-stream'
  ];
  
  // Check if it matches allowed types (including charset)
  const baseType = sanitized.split(';')[0].trim().toLowerCase();
  if (allowedTypes.includes(baseType)) {
    return sanitized;
  }
  
  // Default to application/json if invalid
  return 'application/json';
}

