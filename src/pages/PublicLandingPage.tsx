import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Check, ArrowDown, Shield, Lock, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name too long"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email too long"),
  phone: z.string().trim().min(10, "Phone number too short").max(20, "Phone number too long").regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
});

export const PublicLandingPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input using zod schema
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const validData = validation.data;
      console.log('Submitting form data:', validData);
      
      // Use supabase.functions.invoke which handles CORS properly
      const { data, error } = await supabase.functions.invoke('submit-call-request', {
        body: {
          firstName: validData.firstName,
          lastName: validData.lastName,
          email: validData.email.toLowerCase(),
          phone: validData.phone,
        },
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Invoke error:', error);
        toast.error('Failed to submit. Please try again.');
        return;
      }

      if (data?.error) {
        console.error('Server error:', data.error);
        toast.error(data.error);
        return;
      }

      toast.success("We'll be in touch within 24 hours.");
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    } catch (error: any) {
      console.error('Caught error:', error?.message, error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    // Row 1: Practical levers
    { 
      title: 'Account Closures', 
      desc: 'We contact banks, utilities, and subscriptions and help identify accounts you may not even know exist.',
      examples: ['Banks', 'Credit cards', 'Utilities', 'Streaming services', 'Phone & internet', 'Memberships', 'Locating unknown accounts'],
      effort: '50 - 80 hours saved'
    },
    { 
      title: 'Financial & Estate Organization', 
      desc: 'Comprehensive asset tracking and executor support',
      examples: ['Asset inventory', 'Locate accounts & policies', 'Bills & recurring charges', 'Property & vehicle assets', 'Executor guidance', 'Determine what requires probate'],
      effort: '60 - 120 hours saved'
    },
    { 
      title: 'Legal Paperwork', 
      desc: 'Organized document checklists and filing guidance',
      examples: ['Death certificates', 'Probate preparation', 'Property titles', 'Vehicle transfers', 'Tax documents', 'Letters of instruction/templates'],
      effort: '40 - 90 hours saved'
    },
    // Row 2: Coordination & emotional components
    { 
      title: 'Benefits & Insurance Claims', 
      desc: 'Help navigating Social Security, insurance, and pensions',
      examples: ['Social Security', 'Life insurance', 'Pension plans', '401(k) & IRAs', 'VA benefits', 'Health insurance', 'Employer benefits'],
      effort: '40 - 100 hours saved'
    },
    { 
      title: 'Memorial Planning', 
      desc: 'Obituary drafts, tribute pages, and photo organization',
      examples: ['Obituary drafts', 'Tribute websites', 'Photo galleries', 'Service planning'],
      effort: '20 - 50 hours saved'
    },
    { 
      title: 'Family Coordination', 
      desc: 'Shared dashboard to delegate and track tasks together',
      examples: ['Assign tasks', 'Track progress', 'Share documents', 'Family updates', 'Deadline alerts', 'Progress updates', 'Grief resources', 'Expert guidance'],
      effort: '10 - 30 hours saved'
    },
  ];

  const testimonials = [
    {
      name: "Alec H.",
      role: "Lost her father",
      quote: "When my father passed, I felt completely lost. Honorly handled so much of the paperwork. I finally felt like I could breathe.",
    },
    {
      name: "Gina C.",
      role: "Lost his mother",
      quote: "I didn't realize how many accounts needed to be closed. Honorly guided me through everything else.",
    },
    {
      name: "Katherine M.",
      role: "Lost her husband",
      quote: "Being able to share tasks with family and have Honorly manage the tedious parts made such a difference.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="px-6 py-4 md:px-12 fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 md:h-6 bg-primary rounded-full"></div>
            <span className="text-xl md:text-2xl font-playfair font-semibold tracking-[0.15em] text-foreground uppercase">Honorly</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Stories
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <a 
              href="tel:+16467594118" 
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              (646) 759-4118
            </a>
            <Button 
              onClick={scrollToForm}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero - Full viewport, editorial feel */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative">
        <div className="max-w-5xl mx-auto w-full">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair text-foreground leading-[0.95] tracking-tight max-w-4xl">
              A trusted guide for{' '}
              <span className="text-primary italic">everything</span>{' '}
              after loss
            </h1>

            <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed font-light whitespace-nowrap">
              Grief is overwhelming. The logistics shouldn't be.
            </p>

            <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl leading-relaxed font-light">
              Paperwork, accounts, finances, memorials — we handle it all with clarity and care, so you can focus on what matters.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <Button 
                onClick={scrollToForm}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-medium rounded-full"
              >
                Get Started
              </Button>
              <span className="text-sm text-muted-foreground">
                Free consultation • No obligations
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </section>

      {/* Trust Bar - Seamless transition */}
      <section className="px-6 md:px-12 py-16 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <p className="text-muted-foreground text-sm uppercase tracking-widest">Trusted by families nationwide</p>
            <div className="flex items-center gap-12 md:gap-16">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-playfair font-semibold text-foreground">200+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Hours saved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-playfair font-semibold text-foreground">100+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Tasks managed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-playfair font-semibold text-foreground">1-on-1</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Human support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form - Clean, prominent */}
      <section id="contact-form" className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left - Context */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-playfair text-foreground leading-tight">
                Let's start with a conversation
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Share your information and a member of our Care Team will reach out within 24 hours to understand your situation and how we can help.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No pressure, no obligations</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Personalized guidance for your situation</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Compassionate, experienced team</p>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground text-sm">
                    First Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-card border-border h-12 rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground text-sm">
                    Last Name <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-card border-border h-12 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm">
                  Email <span className="text-primary">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-card border-border h-12 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground text-sm">
                  Phone Number <span className="text-primary">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-card border-border h-12 rounded-lg"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base font-medium rounded-full"
              >
                {isSubmitting ? 'Submitting...' : 'Request a Call'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to be contacted by Honorly. You can opt out anytime.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works - Editorial style */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 md:py-32 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">How it works</p>
          <h2 className="text-3xl md:text-4xl font-playfair text-foreground mb-16">
            Three steps to peace of mind
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Tell us your situation', desc: 'Answer a few simple questions about your loved one and your needs.' },
              { step: '02', title: 'Get your personalized plan', desc: 'We create a customized roadmap and start handling tasks for you.' },
              { step: '03', title: 'Focus on what matters', desc: 'We manage the paperwork while you spend time with family.' },
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <span className="text-5xl font-playfair text-primary/30 font-semibold">{item.step}</span>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 md:px-12 py-24 md:py-32 bg-section-dark">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4">What we handle</p>
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-16">
            Everything, all in one place
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
                <div 
                key={i} 
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 overflow-hidden min-h-[340px]"
              >
                <div className="transition-opacity duration-300 group-hover:opacity-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.desc}</p>
                </div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Examples</p>
                    <div className="flex flex-wrap gap-1.5">
                      {feature.examples.map((example, j) => (
                        <span key={j} className="text-xs bg-white/10 text-white/90 px-2 py-1 rounded-full">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3 flex-shrink-0">
                    <span className="text-white font-medium text-sm">{feature.title}</span>
                    <span className="text-primary text-sm font-semibold">{feature.effort}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-playfair text-foreground mb-16">
            Families we've helped
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed text-lg">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">Security</p>
          <h2 className="text-3xl md:text-4xl font-playfair text-foreground mb-16">
            How we protect your data
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">SOC 2 Compliant</h3>
              <p className="text-muted-foreground leading-relaxed">
                We meet the highest industry standards for security, availability, and confidentiality of your data.
              </p>
            </div>
            
            <div className="space-y-4">
              <Eye className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Bank-Level Encryption</h3>
              <p className="text-muted-foreground leading-relaxed">
                All data is protected with AES-256 encryption, the same standard used by major financial institutions.
              </p>
            </div>
            
            <div className="space-y-4">
              <Lock className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Your Data Stays Yours</h3>
              <p className="text-muted-foreground leading-relaxed">
                We never sell or share your personal information. Your family's documents are accessed only by your Care Team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};