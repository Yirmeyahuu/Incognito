/**
 * Sanitize user message to prevent XSS and other attacks
 */
export const sanitizeMessage = (message: string): string => {
  // Remove any HTML tags
  let sanitized = message.replace(/<[^>]*>/g, '');
  
  // Remove script tags content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to 1000 characters
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
};

/**
 * Validate message content
 */
export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (message.trim().length < 3) {
    return { isValid: false, error: 'Message must be at least 3 characters long' };
  }
  
  if (message.trim().length > 1000) {
    return { isValid: false, error: 'Message must be less than 1000 characters' };
  }
  
  return { isValid: true };
};