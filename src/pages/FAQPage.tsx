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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <Link to="/" className="font-playfair text-xl font-semibold text-foreground">
            HONORLY
          </Link>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about Honorly
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions?
            </p>
            <Link 
              to="/#contact" 
              className="text-primary hover:underline font-medium"
            >
              Contact us for more information
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
