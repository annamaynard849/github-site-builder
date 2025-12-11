import { useEffect } from 'react';
import { SecurityUtils } from '@/lib/security';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  useEffect(() => {
    // Set CSRF token on app load
    SecurityUtils.setCSRFToken();

    // Apply basic security headers via meta tags (limited but better than nothing)
    const addSecurityMeta = () => {
      const head = document.head;
      
      // Content Security Policy (more permissive to allow Vite dev server)
      const csp = document.createElement('meta');
      csp.httpEquiv = 'Content-Security-Policy';
      csp.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; connect-src 'self' wss: https:;";
      head.appendChild(csp);

      // X-Frame-Options equivalent (SAMEORIGIN allows Lovable iframe)
      const frameOptions = document.createElement('meta');
      frameOptions.httpEquiv = 'X-Frame-Options';
      frameOptions.content = 'SAMEORIGIN';
      head.appendChild(frameOptions);

      // Referrer Policy
      const referrer = document.createElement('meta');
      referrer.name = 'referrer';
      referrer.content = 'strict-origin-when-cross-origin';
      head.appendChild(referrer);
    };

    addSecurityMeta();

    // Security event logging for page load
    SecurityUtils.logSecurityEvent('app_initialized', {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    // Monitor for potential security issues
    const handleError = (event: ErrorEvent) => {
      SecurityUtils.logSecurityEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      SecurityUtils.logSecurityEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString()
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}