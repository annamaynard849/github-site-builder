import { CheckCircle } from 'lucide-react';

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up in seconds and begin your journey toward peace of mind."
  },
  {
    number: "02",
    title: "Choose Your Path",
    description: "Whether planning ahead or honoring a recent loss, we'll guide you every step."
  },
  {
    number: "03",
    title: "Build & Preserve",
    description: "Add memories, upload documents, and invite loved ones to contribute."
  },
  {
    number: "04",
    title: "Share With Care",
    description: "Control who sees what, when. Your memories, your rules."
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="px-6 py-20 md:py-28 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-medium text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg font-inter text-muted-foreground max-w-2xl mx-auto">
            A simple, thoughtful process designed around your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-x-4" />
              )}
              
              <div className="text-center lg:text-left">
                <span className="inline-block text-5xl font-playfair font-light text-primary/30 mb-4">
                  {step.number}
                </span>
                <h3 className="text-xl font-playfair font-medium text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
