import { supabase } from "@/integrations/supabase/client";

// Input validation and sanitization utilities
export const SecurityUtils = {
  // Sanitize text input to prevent XSS
  sanitizeText(input: string): string {
    return input
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .trim();
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate password strength
  isStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    return { valid: errors.length === 0, errors };
  },

  // Validate name fields
  isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
    return nameRegex.test(name.trim());
  },

  // Rate limiting check
  async checkRateLimit(endpoint: string, action?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: { endpoint, action }
      });

      if (error) {
        console.error('Rate limiter error:', error);
        return true; // Allow on error to prevent blocking
      }

      return !data?.rateLimited;
    } catch (error) {
      console.error('Rate limiter request failed:', error);
      return true; // Allow on error
    }
  },

// Enhanced security event logging with database storage
  async logSecurityEvent(event: string, details: Record<string, any> = {}): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const logData = {
        event,
        timestamp,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        ...details
      };
      
      console.warn(`Security Event: ${event}`, logData);
      
      // Store security events for monitoring
      try {
        await supabase.functions.invoke('log-security-event', {
          body: {
            event_type: event,
            details: logData,
          },
        });
      } catch (fnError) {
        console.error('Failed to store security log (edge):', fnError);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  },

  // Enhanced content validation with XSS protection
  validateAndSanitizeContent(content: string, maxLength: number = 5000): { valid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    let sanitized = content;

    // Length validation
    if (content.length > maxLength) {
      errors.push(`Content exceeds maximum length of ${maxLength} characters`);
      return { valid: false, sanitized: '', errors };
    }

    // XSS pattern detection (enhanced)
    const xssPatterns = [
      /<script[\s\S]*?>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /onmouseover\s*=/i,
      /onfocus\s*=/i,
      /onblur\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
      /data:text\/html/i
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(content)) {
        errors.push('Content contains potentially dangerous elements');
        return { valid: false, sanitized: '', errors };
      }
    }

    // Enhanced sanitization
    sanitized = this.sanitizeText(content);

    // Additional HTML entity encoding for safety
    sanitized = sanitized
      .replace(/\(/g, '&#40;')
      .replace(/\)/g, '&#41;')
      .replace(/\[/g, '&#91;')
      .replace(/\]/g, '&#93;');

    return { valid: true, sanitized, errors: [] };
  },

  // CSRF token generation and validation
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for server-side
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  setCSRFToken(): string {
    const token = this.generateCSRFToken();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf_token', token);
    }
    return token;
  },

  validateCSRFToken(token: string): boolean {
    if (typeof window === 'undefined') return true; // Skip validation server-side
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  },

  // File upload security validation
  validateFileUpload(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Size validation
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }

    // Type validation
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Name validation
    if (this.containsSuspiciousContent(file.name)) {
      errors.push('Filename contains suspicious characters');
    }

    return { valid: errors.length === 0, errors };
  },

  // Enhanced session security validation
  isSessionExpired(session: any, timeoutMinutes: number = 60): boolean {
    if (!session || !session.expires_at) return true;
    
    // Supabase expires_at is in seconds, convert to milliseconds
    const expiryTime = new Date(session.expires_at * 1000);
    const now = new Date();
    
    // Check if session has expired
    const isExpired = now.getTime() > expiryTime.getTime();
    
    // Log session validation for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Session validation:', {
        expires_at: session.expires_at,
        expiryTime: expiryTime.toISOString(),
        now: now.toISOString(),
        isExpired
      });
    }
    
    return isExpired;
  },

  // Enhanced session invalidation
  async invalidateSession(reason: string = 'security_logout'): Promise<void> {
    try {
      await this.logSecurityEvent('session_invalidated', { reason });
      await supabase.auth.signOut();
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('supabase.auth.token');
      }
    } catch (error) {
      console.error('Failed to invalidate session:', error);
    }
  },

  // Rate limiting for sensitive operations
  async checkSensitiveOperationLimit(operation: string, maxAttempts: number = 3): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    
    const key = `rate_limit_${operation}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    const { count, resetTime } = JSON.parse(stored);
    
    if (now > resetTime) {
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    if (count >= maxAttempts) {
      await this.logSecurityEvent('rate_limit_exceeded', { operation, attempts: count });
      return false;
    }
    
    localStorage.setItem(key, JSON.stringify({ count: count + 1, resetTime }));
    return true;
  },

  // Validate text length
  isValidLength(text: string, maxLength: number = 1000): boolean {
    return text.length <= maxLength;
  },

  // Check for suspicious patterns
  containsSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /eval\(/i,
      /expression\(/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }
};

// Enhanced authentication security
export const AuthSecurity = {
  async secureSignUp(email: string, password: string, firstName: string, lastName: string) {
    // Rate limiting
    const rateLimitPassed = await SecurityUtils.checkRateLimit('auth/signup');
    if (!rateLimitPassed) {
      throw new Error('Too many signup attempts. Please try again later.');
    }

    // Input validation
    if (!SecurityUtils.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = SecurityUtils.isStrongPassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    if (!SecurityUtils.isValidName(firstName) || !SecurityUtils.isValidName(lastName)) {
      throw new Error('Names can only contain letters, spaces, hyphens, and apostrophes');
    }

    // Sanitize inputs
    const sanitizedFirstName = SecurityUtils.sanitizeText(firstName);
    const sanitizedLastName = SecurityUtils.sanitizeText(lastName);

    // Check for suspicious content
    if (SecurityUtils.containsSuspiciousContent(firstName) || 
        SecurityUtils.containsSuspiciousContent(lastName)) {
      await SecurityUtils.logSecurityEvent('suspicious_signup_attempt', { email });
      throw new Error('Invalid input detected');
    }

    return {
      email: email.toLowerCase().trim(),
      password,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName
    };
  },

  async secureSignIn(email: string, password: string) {
    // Rate limiting
    const rateLimitPassed = await SecurityUtils.checkRateLimit('auth/signin');
    if (!rateLimitPassed) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Input validation
    if (!SecurityUtils.isValidEmail(email)) {
      await SecurityUtils.logSecurityEvent('invalid_email_login_attempt', { email });
      throw new Error('Invalid email format');
    }

    if (!password || password.length < 1) {
      throw new Error('Password is required');
    }

    return {
      email: email.toLowerCase().trim(),
      password
    };
  },

  async logFailedAttempt(email: string, reason: string) {
    await SecurityUtils.logSecurityEvent('failed_login_attempt', { email, reason });
    await SecurityUtils.checkRateLimit('auth/signin', 'failed_login');
  },

  async securePasswordReset(email: string) {
    // Rate limiting for password reset
    const rateLimitPassed = await SecurityUtils.checkRateLimit('auth/password-reset');
    if (!rateLimitPassed) {
      throw new Error('Too many password reset attempts. Please try again later.');
    }

    // Input validation
    if (!SecurityUtils.isValidEmail(email)) {
      await SecurityUtils.logSecurityEvent('invalid_email_password_reset', { email });
      throw new Error('Invalid email format');
    }

    return {
      email: email.toLowerCase().trim()
    };
  },

  async validateSession(session: any): Promise<boolean> {
    if (!session) return false;
    
    // Check if session is expired (60-minute timeout)
    if (SecurityUtils.isSessionExpired(session, 60)) {
      await SecurityUtils.logSecurityEvent('session_expired', { 
        userId: session.user?.id 
      });
      return false;
    }

    return true;
  }
};