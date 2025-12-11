import { Button } from '@/components/ui/button';
import { ArrowRight, Heart } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="px-6 py-20 md:py-28 gradient-section-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-8">
          <Heart className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-medium text-primary-foreground mb-6">
          Begin Your Journey Today
        </h2>
        
        <p className="text-lg font-inter text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether you're preserving precious memories or planning for the future, 
          Honorly is here to help you every step of the way.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="font-inter text-base px-8 py-6 bg-card text-card-foreground hover:bg-card/90 group"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="font-inter text-base px-8 py-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            Schedule a Demo
          </Button>
        </div>
        
        <p className="mt-8 text-sm font-inter text-primary-foreground/60">
          No credit card required • Free forever plan available
        </p>
      </div>
    </section>
  );
};
