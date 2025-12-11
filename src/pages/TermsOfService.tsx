import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 md:px-12 fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="text-xl font-playfair font-semibold tracking-[0.1em] text-foreground uppercase">Honorly</span>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-playfair text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-12">Last updated: December 9, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By clicking "I Agree," creating an account, or accessing Honorly's services, you acknowledge that you have read, understood, and accepted these Terms of Service. If you do not agree, please do not use Honorly. These Terms form a legally binding agreement between you and Honorly, Inc.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">2. Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly provides tools and support to help families navigate practical and administrative tasks following the loss of a loved one. These services may include account closure support, memorial and event planning assistance, document organization, benefits guidance, and family coordination tools. Honorly is designed to help bring clarity and structure to logistical steps after a death.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">3. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to provide accurate and complete information, maintain the confidentiality of your account credentials, and notify us promptly of any unauthorized access or use of your account. You are responsible for all activity under your account.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">4. Authority Representation</h2>
              <p className="text-muted-foreground leading-relaxed">
                By submitting information or taking action related to a deceased individual, you represent that you have the lawful authority or permission to do so. Honorly does not verify such authority and assumes information provided by users is accurate.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">5. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our collection, storage, and use of personal data, including information related to deceased individuals, is governed by our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. Information related to deceased individuals is retained, anonymized, or deleted in accordance with applicable law and our Privacy Policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">6. Limitations of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly is not a law firm, fiduciary, executor, trustee, tax advisor, financial advisor, medical provider, or mental health provider. Honorly offers informational and organizational support only. Any decisions or actions taken based on our services are your responsibility. You should consult licensed professionals for legal, tax, medical, financial, or therapeutic guidance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">7. No Fiduciary or Executor Role</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly does not act as executor, personal representative, trustee, fiduciary, or agent in any estate-related matter. We do not manage assets, distribute property, or represent users in legal or financial proceedings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">8. No Institutional Acting on Your Behalf</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly does not communicate with financial institutions, government agencies, benefit providers, courts, or other third parties on your behalf unless expressly agreed in writing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">9. Non-Clinical Support Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly support staff and care coordinators are not licensed clinicians and do not provide therapy, mental health treatment, medical advice, or crisis intervention. Their role is to provide organizational and logistical guidance, not clinical care.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">10. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly may assist in organizing tasks involving third-party institutions. Honorly does not control these third parties or their actions. Any communications, transactions, or disputes with third-party providers are solely between you and those parties. Honorly is not responsible for errors, outcomes, or decisions made by third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">11. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All Honorly content, including text, design, graphics, and software, is owned by Honorly and protected under intellectual property laws. You may not copy, modify, distribute, reverse engineer, or create derivative works without written permission.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">12. Limitation of Liability and Warranty Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Honorly provides its services "as is" and "as available." Honorly makes no warranties, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, or non-infringement. Honorly does not guarantee uninterrupted, secure, or error-free operation. To the fullest extent permitted by law, Honorly is not liable for indirect, incidental, punitive, consequential, or special damages, loss of data, or reliance on service outputs. Some jurisdictions do not allow exclusion of certain warranties; where not permitted, these limitations apply only to the extent allowed by law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">13. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Honorly, its employees, officers, directors, affiliates, and agents from claims, losses, damages, liabilities, and expenses (including attorney fees) arising from your use of the services, your violation of these Terms, or your violation of another party's rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">14. Governing Law and Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the State of Delaware. Any dispute arising from these Terms or use of the services will be resolved exclusively through binding arbitration administered by the American Arbitration Association in New York County, New York. You waive the right to participate in class actions or class arbitration.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">15. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. When we do, we will post the revised version on our website. Continued use of Honorly after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">16. Survival</h2>
              <p className="text-muted-foreground leading-relaxed">
                Provisions relating to arbitration, limitations of liability, indemnification, intellectual property, and disclaimers survive termination of these Terms and account closure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-playfair text-foreground">17. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:legal@honorly.com" className="text-primary hover:underline">legal@honorly.com</a><br />
                Phone: <a href="tel:+18473936820" className="text-primary hover:underline">(847) 393-6820</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Honorly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
