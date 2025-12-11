import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="px-6 md:px-12 py-16 md:py-20 bg-background border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 md:h-6 bg-primary rounded-full"></div>
              <span className="text-xl md:text-2xl font-playfair font-semibold tracking-[0.15em] text-foreground uppercase">Honorly</span>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground underline underline-offset-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground underline underline-offset-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground underline underline-offset-4">Contact</h4>
            <ul className="space-y-3">
              <li><a href="tel:+16467594118" className="text-sm text-muted-foreground hover:text-foreground transition-colors">(646) 759-4118</a></li>
              <li><a href="mailto:hello@honorly.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">hello@honorly.com</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} Honorly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
