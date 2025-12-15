import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "Do families really need this type of support?",
    answer: "Yes. Even with plans in place, most families face 70–120 accounts to close and 570 hours of work after a death. Honorly exists because legal documents don't handle the real-world tasks that follow. In the US alone, a massive $84 trillion is set to transfer between generations over the next 25 years. As 70 million baby boomers pass down assets, families will increasingly need help navigating the administrative and financial complexity."
  },
  {
    question: "If we already have an estate attorney, isn't everything taken care of?",
    answer: "Not quite. Attorneys draft documents — they don't close accounts, notify institutions, gather financial records, or manage dozens of administrative tasks. Honorly handles the execution so nothing stalls or slips through the cracks."
  },
  {
    question: "Does Honorly replace an estate attorney?",
    answer: "No. Estate attorneys handle the legal requirements of the estate, but they typically don't manage the follow-through — things like closing accounts, notifying institutions, gathering documents, or coordinating logistics. Honorly steps in to handle that administrative workload, taking the burden off of families."
  },
  {
    question: "What does Honorly do that a will or trust doesn't?",
    answer: "A will gives instructions. Honorly carries them out — from preparing paperwork to coordinating probate steps to closing accounts — so families aren't left doing it alone."
  },
  {
    question: "How can you close accounts for my loved one if you are not the executor?",
    answer: "We act only with a written authorization from the court-appointed executor or trustee. Once they sign a Letter of Authority, Honorly can handle account closures and documentation on their behalf while they retain full decision-making control."
  },
  {
    question: "Why would I need Honorly if the estate seems simple?",
    answer: "Even \"simple\" estates involve dozens of account closures, notifications, and forms. Every institution has its own process. Honorly uses AI to streamline it all, saving families time, stress, and money."
  }
];

export default function FAQPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header - Matching landing page */}
      <header className="px-6 py-4 md:px-12 fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-1 h-5 md:h-6 bg-primary rounded-full"></div>
            <span className="text-xl md:text-2xl font-playfair font-semibold tracking-[0.15em] text-foreground uppercase">Honorly</span>
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 md:pb-32">
        <div className="px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            {/* Section Header - Editorial style matching landing page */}
            <div className="mb-16">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
                Questions & Answers
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-foreground leading-tight mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl leading-relaxed font-light">
                Find answers to common questions about how Honorly supports families through loss.
              </p>
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="w-full max-w-3xl">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b border-border/50 py-2"
                >
                  <AccordionTrigger className="text-left text-foreground hover:no-underline text-lg md:text-xl font-medium py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* CTA Section */}
            <div className="mt-20 pt-12 border-t border-border/50">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
                Still have questions?
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Our Care Team is here to help you navigate this journey.
              </p>
              <a 
                href="mailto:hello@honorly.com" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                hello@honorly.com
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
