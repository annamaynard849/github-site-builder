import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="px-6 py-16 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-playfair font-normal text-foreground tracking-[0.2em]">
                HONORLY
              </span>
            </Link>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed">
              Preserving memories and planning futures with dignity and care.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-playfair font-medium text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-playfair font-medium text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-playfair font-medium text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-sm text-muted-foreground">
            © {new Date().getFullYear()} Honorly. All rights reserved.
          </p>
          <div className="flex items-center gap-1 font-inter text-sm text-muted-foreground">
            Made with <Heart className="w-4 h-4 text-accent mx-1" /> for families everywhere
          </div>
        </div>
      </div>
    </footer>
  );
};
