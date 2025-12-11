import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

export const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <span className="text-xl font-playfair font-semibold tracking-[0.1em] text-foreground uppercase">Honorly</span>
          </div>
        </div>
      </header>

      {/* Hero - Credibility First */}
      <section className="px-6 md:px-12 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4">Why We Exist</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-foreground mb-8 leading-tight">
            Families deserve better than paperwork during grief
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
            When someone passes, their loved ones face an average of 200+ hours of administrative tasks — 
            closing accounts, filing paperwork, navigating bureaucracy — all while grieving. 
            Honorly exists to take that burden off their shoulders.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-playfair text-primary mb-3">200+</p>
              <p className="text-muted-foreground">hours of tasks after a loved one passes</p>
            </div>
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-playfair text-primary mb-3">70+</p>
              <p className="text-muted-foreground">institutions to notify and close accounts</p>
            </div>
            <div className="p-6">
              <p className="text-4xl md:text-5xl font-playfair text-primary mb-3">12+</p>
              <p className="text-muted-foreground">months to fully settle an estate</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="px-6 md:px-12 py-16 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair text-foreground mb-6">What Honorly Does</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We handle the logistics so families can focus on each other. From closing accounts 
            to filing paperwork to coordinating with institutions — we take care of it.
          </p>
          <div className="space-y-4 text-muted-foreground">
            <p className="flex items-start gap-3">
              <span className="text-primary font-medium">→</span>
              <span>We close accounts with banks, utilities, subscriptions, and more</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary font-medium">→</span>
              <span>We handle paperwork for benefits, insurance, and government agencies</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary font-medium">→</span>
              <span>We coordinate with institutions so you don't have to repeat yourself</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary font-medium">→</span>
              <span>We keep your family organized and on track through the entire process</span>
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4">Our Founder</p>
          <h2 className="text-3xl md:text-4xl font-playfair text-foreground mb-8">Built from personal experience</h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Honorly was founded after the loss of someone who shaped everything about how I see the world. 
              My older brother Charlie was my first friend — the kind of person who built entire worlds for 
              the people around him and made everyone feel seen.
            </p>
            <p>
              When he passed, I experienced firsthand how overwhelming the aftermath can be. Not just the grief, 
              but the endless logistics — the accounts, the paperwork, the phone calls with institutions that 
              don't understand what you're going through.
            </p>
            <p>
              I believe that the hardest losses are losing the people who made you feel entirely seen. 
              And during that time, families shouldn't have to navigate bureaucracy alone.
            </p>
            <p>
              Honorly exists to honor Charlie and to help families through the hardest moments of their lives. 
              We take on the burden so they can focus on what actually matters — being together and healing.
            </p>
            <p className="text-foreground font-medium pt-4">
              — Anna Maynard, Founder
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 bg-section-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-playfair text-white mb-6">
            Let us help your family
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            If you're navigating the loss of a loved one, we're here to handle the logistics.
          </p>
          <Link to="/">
            <Button 
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 px-8 py-6 text-base font-medium rounded-full"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  );
};
