/**
 * CWE-918 Fix: URL Validator for preventing SSRF attacks
 * This utility validates and sanitizes URLs to prevent Server-Side Request Forgery
 */

/**
 * Validates if a URL path is safe to use (relative path only, no absolute URLs)
 * @param path - The URL path to validate
 * @returns boolean - true if path is safe, false otherwise
 */
export const isValidRelativePath = (path: string): boolean => {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Check for absolute URLs (http://, https://, ftp://, file://, etc.)
  const absoluteUrlPattern = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
  if (absoluteUrlPattern.test(path)) {
    return false;
  }

  // Check for protocol-relative URLs (//example.com)
  if (path.startsWith('//')) {
    return false;
  }

  // Check for potential URL encoding bypasses
  const suspiciousPatterns = [
    /%2f%2f/i,  // Encoded //
    /%252f/i,   // Double encoded /
    /@/,        // User info in URL
    /\\/,       // Backslash
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(path)) {
      return false;
    }
  }

  return true;
};

/**
 * Validates if a path is safe and starts with forward slash
 * @param path - The path to validate
 * @returns boolean
 */
export const isValidApiPath = (path: string): boolean => {
  if (!isValidRelativePath(path)) {
    return false;
  }

  // API paths should start with / or be empty
  if (path && !path.startsWith('/')) {
    return false;
  }

  return true;
};

/**
 * Sanitizes a URL path by removing potentially dangerous characters
 * @param path - The path to sanitize
 * @returns string - Sanitized path
 */
export const sanitizePath = (path: string): string => {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Remove any null bytes
  let sanitized = path.replace(/\0/g, '');

  // Remove any backslashes
  sanitized = sanitized.replace(/\\/g, '/');

  // Remove duplicate slashes
  sanitized = sanitized.replace(/\/+/g, '/');

  return sanitized;
};

/**
 * Validates if a full URL belongs to allowed domains
 * @param url - The full URL to validate
 * @param allowedDomains - Array of allowed domain patterns
 * @returns boolean
 */
export const isAllowedDomain = (url: string, allowedDomains: string[]): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Check if hostname matches any allowed domain
    return allowedDomains.some(domain => {
      // Exact match
      if (hostname === domain) {
        return true;
      }
      // Subdomain match (e.g., api.example.com matches example.com)
      if (hostname.endsWith('.' + domain)) {
        return true;
      }
      return false;
    });
  } catch (error) {
    // Invalid URL
    return false;
  }
};

/**
 * Validates and constructs a safe API URL
 * @param baseURL - The base URL from environment variable
 * @param path - The API path to append
 * @returns string | null - Safe URL or null if validation fails
 */
export const buildSafeApiUrl = (baseURL: string | undefined, path: string): string | null => {
  // Validate base URL exists
  if (!baseURL) {
    console.error('Base URL is not defined');
    return null;
  }

  // Validate path is safe
  if (!isValidApiPath(path)) {
    console.error('Invalid API path detected:', path);
    return null;
  }

  // Sanitize the path
  const sanitizedPath = sanitizePath(path);

  // Construct the full URL
  try {
    // Remove trailing slash from baseURL if exists
    const cleanBaseURL = baseURL.replace(/\/+$/, '');
    // Ensure path starts with /
    const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;
    
    const fullUrl = `${cleanBaseURL}${cleanPath}`;
    
    // Final validation: ensure the constructed URL is valid
    new URL(fullUrl);
    
    return fullUrl;
  } catch (error) {
    console.error('Failed to construct valid URL:', error);
    return null;
  }
};

/**
 * Get allowed domains from environment or use defaults
 * @returns string[] - Array of allowed domains
 */
export const getAllowedDomains = (): string[] => {
  const envDomains = process.env.NEXT_PUBLIC_ALLOWED_DOMAINS;
  
  if (envDomains) {
    return envDomains.split(',').map(d => d.trim());
  }

  // Default allowed domains (should be configured in environment)
  return [
    'localhost',
    '127.0.0.1',
    '10.100.101.15', // From your axiosInstance
    'gotify.i24.dev', // From notifications
  ];
};

/**
 * Validates URL parameters to prevent injection
 * @param params - URL search parameters
 * @returns boolean
 */
export const validateUrlParams = (params: Record<string, any>): boolean => {
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Check for URL manipulation attempts in parameters
      if (!isValidRelativePath(value) && value.includes('://')) {
        return false;
      }
    }
  }
  return true;
};


