import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="px-6 py-6 border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl md:text-3xl font-playfair font-normal text-foreground tracking-[0.25em]">
            HONORLY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#about" 
            className="text-sm font-inter text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            About
          </a>
          <a 
            href="#how-it-works" 
            className="text-sm font-inter text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            How It Works
          </a>
          <a 
            href="#features" 
            className="text-sm font-inter text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            Features
          </a>
          <a 
            href="#testimonials" 
            className="text-sm font-inter text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            Testimonials
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="font-inter text-sm">
            Sign In
          </Button>
          <Button className="font-inter text-sm">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 animate-fade-in">
          <nav className="flex flex-col gap-4">
            <a href="#about" className="text-sm font-inter text-muted-foreground hover:text-foreground py-2">
              About
            </a>
            <a href="#how-it-works" className="text-sm font-inter text-muted-foreground hover:text-foreground py-2">
              How It Works
            </a>
            <a href="#features" className="text-sm font-inter text-muted-foreground hover:text-foreground py-2">
              Features
            </a>
            <a href="#testimonials" className="text-sm font-inter text-muted-foreground hover:text-foreground py-2">
              Testimonials
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="ghost" className="w-full font-inter text-sm">
                Sign In
              </Button>
              <Button className="w-full font-inter text-sm">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
