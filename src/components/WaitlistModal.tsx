import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: WaitlistData) => void;
}

interface WaitlistData {
  firstName: string;
  lastName: string;
  email: string;
  reason: string;
}

export function WaitlistModal({ isOpen, onClose, onSubmit }: WaitlistModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<WaitlistData>({
    firstName: '',
    lastName: '',
    email: '',
    reason: ''
  });
  const [errors, setErrors] = useState<Partial<WaitlistData>>({});

  const validateForm = () => {
    const newErrors: Partial<WaitlistData> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Submit to Supabase
      const { error } = await (supabase as any)
        .from('waitlist')
        .insert([{
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          interest_reason: formData.reason.trim() || null,
          referral_source: null
        }]);

      if (error) throw error;

      // Send confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-waitlist-confirmation', {
          body: {
            email: formData.email.trim(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim()
          }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          // Don't fail the whole process if email fails
          toast({
            title: "Waitlist signup successful",
            description: "You've been added to our waitlist! Confirmation email may be delayed.",
          });
        }
      } catch (emailError) {
        console.error('Email function call failed:', emailError);
        // Continue with success even if email fails
      }

      // Call custom onSubmit if provided
      if (onSubmit) {
        onSubmit(formData);
      }

      setSuccess(true);
      
      // Analytics event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_submitted', {
          event_category: 'engagement'
        });
      }
      
    } catch (error: any) {
      console.error('Error submitting to waitlist:', error);
      
      // Fallback to localStorage
      const waitlistData = {
        ...formData,
        timestamp: new Date().toISOString()
      };
      
      const existing = JSON.parse(localStorage.getItem('honorly_waitlist') || '[]');
      existing.push(waitlistData);
      localStorage.setItem('honorly_waitlist', JSON.stringify(existing));
      
      console.log('Waitlist data saved to localStorage:', waitlistData);
      setSuccess(true);
      
      toast({
        title: "Submission received",
        description: "Your information has been saved locally. We'll follow up soon!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
      setSuccess(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        reason: ''
      });
    }
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-normal tracking-wide">
            {success ? "You're on the list!" : "Join the Honorly waitlist"}
          </DialogTitle>
          {!success && (
            <p className="text-muted-foreground mt-2 font-light">
              Add your email and we'll let you know the moment Honorly goes live.
            </p>
          )}
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-playfair font-normal tracking-wide">You're on the list.</h3>
            <p className="text-muted-foreground leading-relaxed font-light">
              We'll reach out on launch day with your invite to Honorly. Check your email for a confirmation message.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="font-light">First name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="font-light">Last name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="font-light">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="reason" className="font-light">What brings you to Honorly?</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full font-light tracking-wide" 
              disabled={loading}
            >
              {loading ? 'Joining waitlist...' : 'Join the waitlist'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}