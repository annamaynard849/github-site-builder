import { Button } from '@/components/ui/button';
import { ArrowRight, Heart } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative px-6 py-20 md:py-32 gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border mb-8 animate-fade-in">
          <Heart className="w-4 h-4 text-accent" />
          <span className="text-sm font-inter text-muted-foreground">
            Honoring life's most precious moments
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-medium text-foreground mb-6 animate-fade-in-up leading-tight">
          Preserve What Matters.
          <br />
          <span className="text-primary">Plan With Peace.</span>
        </h1>

        <p className="text-lg md:text-xl font-inter text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-delay-1 leading-relaxed">
          Create meaningful memorials, organize important documents, and ensure your 
          loved ones are cared for—whether you're planning ahead or navigating loss.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
          <Button size="lg" className="font-inter text-base px-8 py-6 group">
            Start Your Journey
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="font-inter text-base px-8 py-6">
            Learn More
          </Button>
        </div>

        <p className="mt-8 text-sm font-inter text-muted-foreground animate-fade-in-delay-3">
          Trusted by thousands of families worldwide
        </p>
      </div>
    </section>
  );
};
