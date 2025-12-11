import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowRight, Shield, Clock, Users, Star, CheckCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";

export const LandingPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="px-6 py-8 border-b border-border/20 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-3xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
              About
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
              How it works
            </a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105">
              Contact
            </a>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground font-light">
                  Welcome back, {user.user_metadata?.first_name || user.email}
                </span>
                <Link to="/dashboard">
                  <Button size="sm" className="rounded-full px-6 hover:scale-105 transition-all duration-300">
                    Continue
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={signOut} className="rounded-full hover:scale-105 transition-all duration-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="rounded-full px-6 hover:scale-105 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="sm" className="rounded-full px-6 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-normal text-foreground leading-tight tracking-wide">
              Honor someone you love, with support at every step
            </h1>
            {/* Force refresh - updated 2025 */}
            
            <div className="h-px w-24 bg-primary/30 mx-auto my-12"></div>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light mb-8">
              Grief is overwhelming. The logistics shouldn't be.
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
              From memorials to paperwork, finances, and emotional support — we help you navigate everything that comes next, one clear step at a time.
            </p>
            
            <div className="pt-12">
              <Button 
                size="lg" 
                className="text-lg px-12 py-6 rounded-full font-light tracking-wide hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl group"
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
              >
                {user ? 'Continue Your Journey' : 'Get Started'}
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="px-6 py-20 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-playfair font-normal text-foreground mb-6 tracking-wide">
              Compassionate guidance when you need it most
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Every family's journey through loss is unique. Our platform adapts to your specific needs, providing personalized support every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-playfair font-normal mb-4 tracking-wide">Memorial Planning</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Create beautiful, personalized memorials that truly honor your loved one's life and legacy.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-playfair font-normal mb-4 tracking-wide">Legal & Financial</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Navigate complex legal and financial matters with expert guidance and simplified processes.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-xl font-playfair font-normal mb-4 tracking-wide">Family Support</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Coordinate with family members and share responsibilities through our collaborative platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-playfair font-normal text-foreground mb-6 tracking-wide">
              A gentle process designed for you
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Our thoughtful approach ensures you never feel overwhelmed while honoring your loved one.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-playfair font-normal text-primary">1</span>
              </div>
              <h4 className="text-xl font-playfair font-normal mb-4 tracking-wide">Share Your Story</h4>
              <p className="text-muted-foreground font-light leading-relaxed">
                Tell us about your loved one and your family's specific needs and preferences.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-playfair font-normal text-primary">2</span>
              </div>
              <h4 className="text-xl font-playfair font-normal mb-4 tracking-wide">Receive Your Plan</h4>
              <p className="text-muted-foreground font-light leading-relaxed">
                Get a personalized roadmap with tasks, timelines, and resources tailored to your situation.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl font-playfair font-normal text-primary">3</span>
              </div>
              <h4 className="text-xl font-playfair font-normal mb-4 tracking-wide">Move Forward Together</h4>
              <p className="text-muted-foreground font-light leading-relaxed">
                Complete tasks at your own pace with ongoing support from our compassionate team.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" variant="outline" className="rounded-full px-12 py-6 text-lg font-light tracking-wide hover:scale-105 transition-all duration-300 border-primary/30 hover:bg-primary/5">
                Learn More About Our Process
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-muted/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-playfair font-normal text-foreground mb-16 tracking-wide">
            Families trust Honorly
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-border/50 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 font-light italic leading-relaxed">
                  "Honorly made an impossible time manageable. They guided us through every detail with such care and understanding."
                </p>
                <div className="text-sm text-muted-foreground font-light">
                  — Sarah M., Boston
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 border-border/50 bg-background/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 font-light italic leading-relaxed">
                  "The personalized approach meant everything to our family. We felt supported every step of the way."
                </p>
                <div className="text-sm text-muted-foreground font-light">
                  — Michael T., Seattle
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-playfair font-normal text-foreground mb-6 tracking-wide">
            Let us help you honor their memory
          </h3>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Every person deserves to be remembered beautifully. Start your journey with Honorly today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" className="text-lg px-12 py-6 rounded-full font-light tracking-wide hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl">
                {user ? "Continue Your Journey" : "Get Started Today"}
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="px-6 py-16 border-t border-border/20 bg-muted/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="mb-6">
                <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
              </div>
              <p className="text-muted-foreground font-light leading-relaxed max-w-md">
                Compassionate guidance for families navigating loss, providing personalized support through every step of honoring your loved one.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-4 tracking-wide">Support</h4>
              <div className="space-y-3 text-sm">
                <div><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Help Center</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Contact Us</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Resources</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-foreground mb-4 tracking-wide">Legal</h4>
              <div className="space-y-3 text-sm">
                <div><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Privacy Policy</a></div>
                <div><a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Terms of Service</a></div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-light">
                © 2025 Honorly. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};