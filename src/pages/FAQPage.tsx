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
    question: "What is Honorly?",
    answer: "Honorly is a compassionate platform designed to help families navigate the difficult tasks that follow the loss of a loved one, or to plan ahead for end-of-life matters. We provide guided support, task management, and resources to ease the burden during challenging times."
  },
  {
    question: "How does Honorly help after losing a loved one?",
    answer: "After a loss, there are many tasks to manage—from legal and financial matters to memorial planning. Honorly provides a personalized roadmap of tasks, connects you with support resources, and helps you coordinate with family members so nothing falls through the cracks."
  },
  {
    question: "Can I use Honorly to plan ahead?",
    answer: "Yes! Our 'Planning Ahead' path allows you to organize important information, document your wishes, and prepare resources for your loved ones, reducing their burden when the time comes."
  },
  {
    question: "Is my information secure?",
    answer: "Absolutely. We take privacy and security seriously. Your data is encrypted, and we never share your personal information with third parties. You control who has access to your information."
  },
  {
    question: "Can I invite family members to help?",
    answer: "Yes, Honorly supports collaboration. You can invite trusted family members or friends to help manage tasks, share updates, and coordinate efforts together."
  },
  {
    question: "How much does Honorly cost?",
    answer: "We offer different plans to meet your needs. Contact us to learn more about our pricing options and find the right fit for your situation."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide both digital resources and human support. Our platform includes grief support resources, and you can request a call with our team for personalized guidance."
  },
  {
    question: "How do I get started?",
    answer: "Simply create an account and choose your path—whether you're dealing with a recent loss or planning ahead. Our onboarding process will guide you through setting up your personalized experience."
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
