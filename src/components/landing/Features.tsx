import { Card, CardContent } from '@/components/ui/card';
import { Shield, Clock, Users, Heart, FileText, Flower } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: "Memorial Pages",
    description: "Create beautiful, lasting tributes to celebrate and remember the lives of those you love."
  },
  {
    icon: FileText,
    title: "Document Vault",
    description: "Securely store and organize important documents, from wills to cherished letters."
  },
  {
    icon: Users,
    title: "Family Sharing",
    description: "Invite family members to contribute memories, photos, and stories together."
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Bank-level encryption ensures your most precious memories stay protected."
  },
  {
    icon: Clock,
    title: "Future Planning",
    description: "Plan ahead with peace of mind, knowing everything is organized for your loved ones."
  },
  {
    icon: Flower,
    title: "Grief Support",
    description: "Access resources and guidance to help navigate difficult times with compassion."
  }
];

export const Features = () => {
  return (
    <section id="features" className="px-6 py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-medium text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg font-inter text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed with care to help you honor, remember, and plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-playfair font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
