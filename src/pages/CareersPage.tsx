import { ArrowLeft, Heart, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Footer } from '@/components/Footer';

export const CareersPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Heart,
      title: 'Compassion First',
      description: 'We approach every interaction with empathy, understanding that our work touches people during their most vulnerable moments.'
    },
    {
      icon: Users,
      title: 'Family-Centered',
      description: 'Every decision we make considers the real families we serve. Their peace of mind is our north star.'
    },
    {
      icon: Sparkles,
      title: 'Thoughtful Innovation',
      description: 'We use technology to reduce burden, not add complexity. Simple solutions for complicated times.'
    }
  ];

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

      {/* Hero */}
      <section className="px-6 md:px-12 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4">Careers</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-foreground mb-6">
            Join the Honorly team
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We're building something meaningful — a service that helps families navigate 
            one of life's most difficult transitions with clarity and care.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 md:px-12 py-16 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-playfair text-foreground text-center mb-12">
            What guides us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Open Roles */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-playfair text-foreground mb-6">
            No open positions right now
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            We're a small, focused team and don't have any openings at the moment. 
            But we're always interested in connecting with talented, compassionate people 
            who would be a great fit — reach out at{' '}
            <a 
              href="mailto:careers@honorly.com" 
              className="text-primary hover:underline font-medium"
            >
              careers@honorly.com
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};
