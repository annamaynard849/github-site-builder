import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, DollarSign, FileText, CheckSquare, BookOpen, TrendingUp, Building2, CreditCard, Shield, PiggyBank, Receipt, Landmark, Wallet, ListChecks, AlertCircle, Lightbulb, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateToCaseByLovedOne } from '@/lib/case-utils';

export default function FinancialHub() {
  const navigate = useNavigate();
  const { lovedOneId } = useParams();
  const { user } = useAuth();
  const [lovedOne, setLovedOne] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && lovedOneId) {
      fetchData();
    }
  }, [user, lovedOneId]);

  const fetchData = async () => {
    try {
      const { data: lovedOneData } = await supabase
        .from('loved_ones')
        .select('*')
        .eq('id', lovedOneId)
        .single();

      setLovedOne(lovedOneData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading financial hub');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-foreground mb-2">Financial Affairs</h1>
              <p className="text-lg text-muted-foreground">
                Tools to manage assets, claims, and financial transitions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">Your Tools</TabsTrigger>
            <TabsTrigger value="guide">Action Plan</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Financial Safety</AlertTitle>
              <AlertDescription>
                Never pay debts from personal funds. All estate debts should be paid from estate assets. Consult with an attorney if you're unsure.
              </AlertDescription>
            </Alert>

            {/* Asset Management Tools */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Asset Management
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Landmark className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Bank Account Tracker</CardTitle>
                        <CardDescription>Organize checking, savings, and CDs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => lovedOneId && navigate(`/hub/accounts/${lovedOneId}`)}
                    >
                      View Accounts
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Track account numbers, balances, and closure status
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Investment Portfolio</CardTitle>
                        <CardDescription>Manage stocks, bonds, and retirement accounts</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => lovedOneId && navigate(`/hub/accounts/${lovedOneId}`)}
                    >
                      View Portfolio
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      401(k)s, IRAs, brokerage accounts, and pensions
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Property & Assets</CardTitle>
                        <CardDescription>Real estate, vehicles, and valuables</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={async () => {
                        if (lovedOneId && user) {
                          await navigateToCaseByLovedOne(lovedOneId, user.id, navigate, '?tab=tasks');
                        }
                      }}
                    >
                      Manage Assets
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Track titles, deeds, appraisals, and ownership transfers
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <PiggyBank className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Estate Value Calculator</CardTitle>
                        <CardDescription>Calculate total estate worth</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      Coming Soon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Automated valuation for tax and distribution planning
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Claims & Benefits */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Claims & Benefits
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Insurance Claims Tracker</CardTitle>
                        <CardDescription>File and track life insurance claims</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={async () => {
                        if (lovedOneId && user) {
                          await navigateToCaseByLovedOne(lovedOneId, user.id, navigate, '?tab=tasks');
                        }
                      }}
                    >
                      Manage Claims
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Track claim status, documents needed, and payout timeline
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Benefits Checklist</CardTitle>
                        <CardDescription>Social Security, VA, and employer benefits</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={async () => {
                        if (lovedOneId && user) {
                          await navigateToCaseByLovedOne(lovedOneId, user.id, navigate, '?tab=tasks');
                        }
                      }}
                    >
                      View Checklist
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Don't miss out on survivor and death benefits
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Obligations & Expenses */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Obligations & Expenses
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Debt Manager</CardTitle>
                        <CardDescription>Track and prioritize estate debts</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      Coming Soon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Mortgages, credit cards, loans, and medical bills
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Expense Tracker</CardTitle>
                        <CardDescription>Log estate administration costs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      Coming Soon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Track reimbursable executor expenses
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ListChecks className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Subscription Canceller</CardTitle>
                        <CardDescription>Find and cancel recurring charges</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      Coming Soon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Stop unwanted charges and memberships
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">Tax Document Organizer</CardTitle>
                        <CardDescription>Prepare for final tax returns</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" disabled>
                      Coming Soon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Organize 1099s, W-2s, and deduction records
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Financial Tips */}
            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Financial Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>File life insurance claims within 30 days for fastest processing</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Don't pay estate debts from personal funds—you're not personally liable</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Freeze credit to prevent identity theft during the transition period</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Keep estate bank account separate—never comingle with personal funds</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Action Plan</CardTitle>
                <CardDescription>Systematic approach to managing financial affairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    phase: 'Immediate Actions (Days 1-7)',
                    duration: 'First week',
                    tasks: [
                      'Notify primary bank and secure access to checking/savings',
                      'Stop automatic payments and direct deposits',
                      'Access safe deposit box (with proper documentation)',
                      'Secure physical valuables and important documents',
                      'Freeze credit with all three bureaus (Experian, Equifax, TransUnion)',
                      'Contact employer for final paycheck and benefits information'
                    ]
                  },
                  {
                    phase: 'Claims & Benefits (Weeks 1-4)',
                    duration: '2-4 weeks',
                    tasks: [
                      'File life insurance claims with all known policies',
                      'Apply for Social Security survivor benefits (call 1-800-772-1213)',
                      'Contact VA for veteran survivor benefits if applicable',
                      'File claims for accidental death or travel insurance if relevant',
                      'Request employer death benefits and retirement account information',
                      'Apply for workers compensation death benefits if applicable'
                    ]
                  },
                  {
                    phase: 'Asset Inventory (Weeks 2-8)',
                    duration: '2-8 weeks',
                    tasks: [
                      'Request statements from all financial institutions',
                      'Value real estate with professional appraisals',
                      'Inventory personal property and valuable items',
                      'Contact all investment and retirement account custodians',
                      'Obtain vehicle titles and current market values',
                      'Document business interests and their valuations',
                      'Create comprehensive spreadsheet of all assets'
                    ]
                  },
                  {
                    phase: 'Debt & Obligations (Months 2-4)',
                    duration: '2-4 months',
                    tasks: [
                      'Send death notification to all creditors',
                      'Review mortgage and consider refinancing or payoff options',
                      'Identify secured vs. unsecured debts',
                      'Negotiate with creditors if estate cannot cover all debts',
                      'Cancel subscriptions, memberships, and recurring services',
                      'Pay ongoing estate expenses (utilities, insurance, taxes)'
                    ]
                  },
                  {
                    phase: 'Tax & Distribution (Months 4-12)',
                    duration: '4-12 months',
                    tasks: [
                      'Work with CPA to file final personal income tax return',
                      'File estate income tax returns (Form 1041) if required',
                      'File estate tax return (Form 706) if estate exceeds exemption',
                      'Pay estate taxes from estate assets',
                      'Settle all valid claims and debts',
                      'Transfer titled assets to beneficiaries',
                      'Close bank accounts and cancel credit cards'
                    ]
                  }
                ].map((phase, index) => (
                  <div key={index} className="relative border-l-2 border-primary pl-6 pb-6 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg">{phase.phase}</h3>
                      <p className="text-sm text-muted-foreground">{phase.duration}</p>
                    </div>
                    <ul className="space-y-2 mt-3">
                      {phase.tasks.map((task, taskIndex) => (
                        <li key={taskIndex} className="flex items-start gap-2 text-sm">
                          <CheckSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Important Deadlines */}
            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Financial Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="font-medium">Life insurance claims</span>
                  <span className="text-muted-foreground">Within 30-60 days for fastest processing</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="font-medium">Social Security survivor benefits</span>
                  <span className="text-muted-foreground">Apply as soon as possible</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="font-medium">Final income tax return</span>
                  <span className="text-muted-foreground">By April 15 of following year</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span className="font-medium">Estate tax return (if required)</span>
                  <span className="text-muted-foreground">Within 9 months of death</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Life Insurance Claims Guide
                  </CardTitle>
                  <CardDescription>Step-by-step process for filing claims and maximizing benefits</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Retirement Account Rules
                  </CardTitle>
                  <CardDescription>Beneficiary rights, required distributions, and tax implications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Estate Debt Priority
                  </CardTitle>
                  <CardDescription>Which debts must be paid first and how to handle creditors</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Tax Guide for Estates
                  </CardTitle>
                  <CardDescription>Federal and state tax obligations, exemptions, and filing requirements</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    Joint Account Rights
                  </CardTitle>
                  <CardDescription>Understanding rights of survivorship and account transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Avoiding Financial Scams
                  </CardTitle>
                  <CardDescription>Protect the estate from fraud and identity theft during transition</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Read Guide
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* External Resources */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Government & Financial Resources</CardTitle>
                <CardDescription>Official resources for financial management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="https://www.ssa.gov/benefits/survivors/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  Social Security Administration - Survivor Benefits
                </a>
                <a href="https://www.irs.gov/businesses/small-businesses-self-employed/deceased-taxpayers-filing-the-estate-income-tax-return-form-1041" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  IRS - Estate Tax Returns and Obligations
                </a>
                <a 
                   href="https://www.consumerfinance.gov/ask-cfpb/what-happens-to-debt-after-someone-dies-en-1463/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  Consumer Financial Protection Bureau - Debt After Death
                </a>
                <a 
                   href="https://www.va.gov/burials-memorials/survivors-dependents-benefits/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  Department of Veterans Affairs - Survivor Benefits
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
