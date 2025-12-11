import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Scale, FileText, CheckSquare, BookOpen, AlertCircle, FolderOpen, ClipboardList, Calendar, Calculator, FileSearch, Briefcase, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateToCaseByLovedOne } from '@/lib/case-utils';

export default function LegalHub() {
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
      toast.error('Error loading legal hub');
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
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-foreground mb-2">Legal Affairs</h1>
              <p className="text-lg text-muted-foreground">
                Tools and resources to navigate estate administration
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
            <TabsTrigger value="guide">Timeline Guide</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Legal Disclaimer</AlertTitle>
              <AlertDescription>
                These tools are for organizational purposes. Please consult with a licensed attorney for legal advice specific to your situation.
              </AlertDescription>
            </Alert>

            {/* Priority Tools */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Document Organizer</CardTitle>
                      <CardDescription>Track and manage essential legal documents</CardDescription>
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
                    Open Organizer
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Keep track of death certificates, wills, trusts, and other critical documents
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Estate Inventory</CardTitle>
                      <CardDescription>Catalog assets, property, and valuables</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={() => lovedOneId && navigate(`/hub/financial/${lovedOneId}`)}
                  >
                    View Inventory
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Document real estate, bank accounts, investments, and personal property
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Deadline Tracker</CardTitle>
                      <CardDescription>Never miss critical legal deadlines</CardDescription>
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
                    View Deadlines
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Track court dates, filing deadlines, and time-sensitive requirements
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Probate Calculator</CardTitle>
                      <CardDescription>Estimate timeline and costs for your state</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    Coming Soon
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Get estimates based on estate value and complexity
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileSearch className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Legal Forms Library</CardTitle>
                      <CardDescription>Access state-specific legal forms</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    Coming Soon
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Download templates for affidavits, inventories, and filings
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Attorney Finder</CardTitle>
                      <CardDescription>Connect with estate attorneys near you</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    Coming Soon
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Find qualified probate and estate attorneys in your area
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card className="bg-muted/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Quick Legal Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Order 10-15 certified death certificates—you'll need them for various institutions</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Don't distribute assets before consulting an attorney—some transfers may require court approval</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Keep detailed records of all expenses—executor fees may be available for reimbursement</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Scale className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Probate timelines vary by state—simple estates may take 6-9 months, complex ones 12+ months</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estate Administration Timeline</CardTitle>
                <CardDescription>Navigate the estate settlement process step by step</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    phase: 'Immediate Actions (Week 1)',
                    duration: 'First 7 days',
                    tasks: [
                      'Obtain 10-15 certified copies of death certificate',
                      'Secure property, vehicles, and valuable items',
                      'Locate will, trust documents, and safe deposit boxes',
                      'Contact estate attorney for initial consultation',
                      'Notify immediate family and beneficiaries'
                    ]
                  },
                  {
                    phase: 'Legal Foundation (Weeks 2-4)',
                    duration: '2-4 weeks',
                    tasks: [
                      'File will with probate court in county of residence',
                      'Apply for executor/administrator appointment',
                      'Obtain Letters Testamentary or Letters of Administration',
                      'Apply for Tax ID number (EIN) for the estate',
                      'Open estate bank account',
                      'Notify creditors through required publication'
                    ]
                  },
                  {
                    phase: 'Asset Management (Months 2-6)',
                    duration: '2-6 months',
                    tasks: [
                      'Create comprehensive inventory of all assets',
                      'Get property and valuables appraised',
                      'Cancel subscriptions and unnecessary services',
                      'Maintain property and pay ongoing expenses',
                      'Review and pay valid debts and claims',
                      'File final income tax returns',
                      'File estate tax return if applicable'
                    ]
                  },
                  {
                    phase: 'Distribution & Closing (Months 6-12+)',
                    duration: '6-12 months',
                    tasks: [
                      'Prepare final accounting for court approval',
                      'Obtain court approval for asset distribution',
                      'Distribute specific bequests to beneficiaries',
                      'Distribute residual estate according to will',
                      'File petition to close estate',
                      'Obtain discharge from court',
                      'Close estate bank account'
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

            {/* State-specific note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>State-Specific Requirements</AlertTitle>
              <AlertDescription>
                Probate laws vary significantly by state. Some states have simplified processes for smaller estates. 
                Consult with a local estate attorney to understand requirements in your jurisdiction.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:border-primary/40 transition-all">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Understanding Probate
                  </CardTitle>
                  <CardDescription>Complete guide to the probate process, when it's required, and how to navigate it</CardDescription>
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
                    <Calculator className="h-4 w-4 text-primary" />
                    Estate & Inheritance Tax
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
                    <Briefcase className="h-4 w-4 text-primary" />
                    Executor Responsibilities
                  </CardTitle>
                  <CardDescription>Complete guide to executor duties, legal obligations, and best practices</CardDescription>
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
                    Will vs Trust vs TOD
                  </CardTitle>
                  <CardDescription>Understanding different estate planning tools and their implications</CardDescription>
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
                    <Scale className="h-4 w-4 text-primary" />
                    Small Estate Affidavits
                  </CardTitle>
                  <CardDescription>When and how to use simplified probate procedures for smaller estates</CardDescription>
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
                    Common Probate Mistakes
                  </CardTitle>
                  <CardDescription>Learn from others' experiences—avoid costly errors in estate administration</CardDescription>
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
                <CardTitle className="text-lg">Government Resources</CardTitle>
                <CardDescription>Official resources for estate administration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="https://www.irs.gov/businesses/small-businesses-self-employed/deceased-taxpayers-filing-the-estate-income-tax-return-form-1041" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  IRS - Estate Tax Returns
                </a>
                <a href="https://www.ssa.gov/benefits/survivors/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  Social Security - Survivors Benefits
                </a>
                <a href="https://www.usa.gov/after-death" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  USA.gov - What To Do After Someone Dies
                </a>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
