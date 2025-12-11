import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WaitlistModal } from './WaitlistModal';

interface AccessGateProps {
  children: React.ReactNode;
}

const VALID_PASSCODES = ['565broome'];
const ACCESS_KEY = 'honorly_access';
const ATTEMPTS_KEY = 'honorly_passcode_attempts';

// Global helper function
declare global {
  interface Window {
    honorlyRevoke?: () => void;
  }
}

export function AccessGate({ children }: AccessGateProps) {
  const navigate = useNavigate();
  const [isGateOpen, setIsGateOpen] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showWaitlist, setShowWaitlist] = useState(false);

  useEffect(() => {
    // Check for preview bypass
    const urlParams = new URLSearchParams(window.location.search);
    const hasPreviewParam = urlParams.get('preview') === '1';
    
    // Check for existing access
    const hasAccess = sessionStorage.getItem(ACCESS_KEY) === 'granted';
    
    // Get attempt count
    const storedAttempts = parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || '0');
    setAttempts(storedAttempts);
    
    if (hasPreviewParam || hasAccess) {
      setIsGateOpen(false);
    }

    // Set up global revoke helper
    window.honorlyRevoke = () => {
      sessionStorage.removeItem(ACCESS_KEY);
      sessionStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      setIsGateOpen(true);
      setPasscode('');
      setError('');
      setAttempts(0);
      console.log('Honorly access revoked');
    };

    return () => {
      delete window.honorlyRevoke;
    };
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (VALID_PASSCODES.includes(passcode)) {
      // Success
      sessionStorage.setItem(ACCESS_KEY, 'granted');
      sessionStorage.removeItem(ATTEMPTS_KEY); // Reset attempts on success
      setIsGateOpen(false);
      setError('');
      
      console.log('Access granted - ungating site');
      
      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'passcode_success', {
          event_category: 'access'
        });
      }
    } else {
      // Failed attempt
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      sessionStorage.setItem(ATTEMPTS_KEY, newAttempts.toString());
      setError("That code didn't work.");
      
      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'passcode_failure', {
          event_category: 'access',
          value: newAttempts
        });
      }
      
      // Auto-open waitlist after 3 attempts
      if (newAttempts >= 3) {
        setShowWaitlist(true);
      }
    }
  };

  const handleWaitlistOpen = () => {
    setShowWaitlist(true);
    // Analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'waitlist_opened', {
        event_category: 'engagement',
        event_label: 'from_passcode_gate'
      });
    }
  };

  // Don't render gate if it should be closed
  if (!isGateOpen) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Full-screen modal overlay */}
      <Dialog open={isGateOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-[480px]" // Remove the hidden close button class
          onInteractOutside={(e) => e.preventDefault()} // Prevent closing
          onEscapeKeyDown={(e) => e.preventDefault()} // Prevent ESC close
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-playfair font-normal tracking-wide">
              Private preview
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-center text-muted-foreground">
              Honorly is in limited pilot. Enter your passcode or join the waitlist to get early access.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="passcode" className="sr-only">Passcode</Label>
                <Input
                  id="passcode"
                  type="password"
                  placeholder="Enter your passcode"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(''); // Clear error on input
                  }}
                  className={error ? 'border-destructive' : ''}
                />
                {error && (
                  <p className="text-sm text-destructive mt-2">{error}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleWaitlistOpen}
                className="text-sm text-primary hover:underline"
              >
                Don't have a code? Join the waitlist
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
      />

      {/* Hide page content with overlay */}
      <div className="fixed inset-0 bg-background z-40" />
    </>
  );
}