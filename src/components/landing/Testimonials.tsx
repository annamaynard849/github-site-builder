import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Honorly gave me the space to grieve while keeping my father's memory alive. The memorial page we created brings our family together.",
    author: "Sarah M.",
    role: "Daughter & Caregiver",
    stars: 5
  },
  {
    quote: "Planning ahead felt overwhelming until I found Honorly. Now I have peace of mind knowing everything is organized for my family.",
    author: "Robert K.",
    role: "Father of Three",
    stars: 5
  },
  {
    quote: "The collaborative features let our whole family contribute to Mom's memorial. It's become a beautiful digital heirloom.",
    author: "Jennifer L.",
    role: "Family Organizer",
    stars: 5
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="px-6 py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-medium text-foreground mb-4">
            Stories of Comfort
          </h2>
          <p className="text-lg font-inter text-muted-foreground max-w-2xl mx-auto">
            Hear from families who found peace and connection through Honorly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="font-inter text-foreground leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-playfair font-medium text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="font-inter text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
