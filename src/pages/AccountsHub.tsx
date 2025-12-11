import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { navigateToCaseByLovedOne } from '@/lib/case-utils';
import { 
  ArrowLeft, 
  Mail,
  Users,
  DollarSign,
  Zap,
  ShoppingCart,
  Download,
  ExternalLink,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Copy,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccountsHub() {
  const navigate = useNavigate();
  const { lovedOneId } = useParams();
  const { user } = useAuth();
  const [lovedOne, setLovedOne] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
      toast.error('Error loading accounts hub');
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    toast.success('Template copied to clipboard');
  };

  const accountCategories = [
    {
      id: 'email',
      title: 'Email & Communication',
      icon: <Mail className="h-5 w-5" />,
      description: 'Email providers, messaging apps, and communication platforms',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      accounts: ['Gmail', 'Outlook', 'Yahoo', 'iCloud', 'ProtonMail'],
      priority: 'High'
    },
    {
      id: 'social',
      title: 'Social Media',
      icon: <Users className="h-5 w-5" />,
      description: 'Social networks and online communities',
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      accounts: ['Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Snapchat'],
      priority: 'Medium'
    },
    {
      id: 'financial',
      title: 'Financial Services',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Banks, credit cards, investments, and payment platforms',
      color: 'bg-green-500/10 text-green-600 border-green-500/20',
      accounts: ['Banks', 'Credit Cards', 'PayPal', 'Venmo', 'Investment Accounts', 'Cryptocurrency'],
      priority: 'Critical'
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions',
      icon: <ShoppingCart className="h-5 w-5" />,
      description: 'Streaming services, memberships, and recurring charges',
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      accounts: ['Netflix', 'Spotify', 'Amazon Prime', 'Gym Memberships', 'News Subscriptions'],
      priority: 'Medium'
    },
    {
      id: 'utilities',
      title: 'Utilities & Services',
      icon: <Zap className="h-5 w-5" />,
      description: 'Essential services and utilities',
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      accounts: ['Electric', 'Gas', 'Water', 'Internet', 'Phone', 'Trash'],
      priority: 'High'
    }
  ];

  const notificationTemplates = [
    {
      title: 'Bank Account Closure Letter',
      description: 'Template for notifying banks of a death',
      template: `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Bank Name]
[Bank Address]
[City, State ZIP]

Re: Notification of Death - Account Holder: [Deceased Name]
Account Number(s): [Account Numbers]

Dear Sir/Madam,

I am writing to notify you of the death of [Deceased Name], who held the above-referenced account(s) with your institution. [He/She] passed away on [Date of Death].

I am the [Executor/Administrator] of the estate, and I am enclosing the following documents:
- Certified copy of the death certificate
- Letters Testamentary/Letters of Administration
- Proof of my identification

Please freeze the account(s) and provide me with instructions on how to proceed with closing or transferring these accounts as part of the estate settlement process.

I can be reached at [Your Phone] or [Your Email] if you need any additional information.

Thank you for your assistance during this difficult time.

Sincerely,
[Your Name]
[Your Title - Executor/Administrator]`
    },
    {
      title: 'Credit Card Notification',
      description: 'Template for credit card companies',
      template: `[Date]

[Credit Card Company]
Customer Service Department
[Address]

Re: Notification of Cardholder Death
Account Number: [Last 4 digits]
Cardholder Name: [Deceased Name]

Dear Customer Service,

I am writing to inform you that [Deceased Name], holder of account ending in [Last 4 digits], passed away on [Date of Death].

Please cancel this account immediately and send a final statement to:
[Your Address]
[City, State ZIP]

Enclosed please find a certified copy of the death certificate.

If there are any outstanding balances, please send information about how to address them as part of the estate settlement.

Contact: [Your Phone] or [Your Email]

Sincerely,
[Your Name]
[Relationship to Deceased]`
    },
    {
      title: 'Social Media Memorialization Request',
      description: 'Template for social media platforms',
      template: `I am writing to request memorialization/deletion of the account belonging to [Deceased Name].

Account Details:
- Full Name: [Name]
- Profile URL: [URL if known]
- Date of Death: [Date]
- Relationship to Deceased: [Your Relationship]

I have attached:
- Copy of death certificate
- Proof of my authority to act

Please [memorialize/delete] this account according to your policies.

Contact Information:
Email: [Your Email]
Phone: [Your Phone]

Thank you for your assistance.`
    }
  ];

  const stepByStepGuides = [
    {
      category: 'Financial Accounts',
      icon: <DollarSign className="h-6 w-6" />,
      steps: [
        {
          title: 'Gather Account Information',
          description: 'Collect all bank statements, credit card info, and investment account details',
          tips: ['Check mail and email for statements', 'Look for online account access', 'Review tax returns for account listings']
        },
        {
          title: 'Obtain Legal Documents',
          description: 'Get certified death certificates and letters testamentary/administration',
          tips: ['Order 10-15 certified copies', 'Keep originals safe', 'Make photocopies for your records']
        },
        {
          title: 'Notify Each Institution',
          description: 'Contact banks, credit card companies, and investment firms directly',
          tips: ['Call customer service first', 'Follow up with written notice', 'Request account freeze immediately']
        },
        {
          title: 'Transfer or Close Accounts',
          description: 'Work with institutions to properly transfer or close accounts',
          tips: ['Get written confirmation', 'Keep records of all transactions', 'Update beneficiaries on remaining accounts']
        }
      ]
    },
    {
      category: 'Email & Digital Accounts',
      icon: <Mail className="h-6 w-6" />,
      steps: [
        {
          title: 'Access Email if Possible',
          description: 'Try to access email accounts to identify other accounts and services',
          tips: ['Look for password managers', 'Check for subscription confirmations', 'Search for "invoice" and "receipt" emails']
        },
        {
          title: 'Create Account Inventory',
          description: 'List all discovered accounts and their login information',
          tips: ['Document each account found', 'Note any auto-renewal subscriptions', 'Check browser saved passwords']
        },
        {
          title: 'Submit Closure Requests',
          description: 'Use each platform\'s deceased user process',
          tips: ['Most platforms have special forms', 'Provide death certificate when requested', 'Consider memorialization vs deletion']
        }
      ]
    },
    {
      category: 'Subscriptions & Memberships',
      icon: <ShoppingCart className="h-6 w-6" />,
      steps: [
        {
          title: 'Review Bank Statements',
          description: 'Check 3-6 months of statements for recurring charges',
          tips: ['Look for monthly patterns', 'Check credit card statements too', 'Note annual subscriptions that may renew']
        },
        {
          title: 'Cancel Active Subscriptions',
          description: 'Contact each service to cancel and request refunds if applicable',
          tips: ['Some may offer prorated refunds', 'Cancel auto-renewal first', 'Get confirmation emails']
        },
        {
          title: 'Monitor for Future Charges',
          description: 'Watch statements for 2-3 months after cancellation',
          tips: ['Report unauthorized charges', 'Keep cancellation confirmations', 'Consider closing payment methods']
        }
      ]
    }
  ];

  const resourceLinks = [
    {
      category: 'Financial',
      resources: [
        { name: 'Federal Trade Commission - Death & Credit', url: 'https://consumer.ftc.gov/articles/death-and-credit' },
        { name: 'Consumer Financial Protection Bureau', url: 'https://www.consumerfinance.gov/consumer-tools/deceased-relative/' },
        { name: 'FDIC - Managing Accounts After Death', url: 'https://www.fdic.gov/resources/consumers/' }
      ]
    },
    {
      category: 'Social Media',
      resources: [
        { name: 'Facebook Memorialization', url: 'https://www.facebook.com/help/1506822589577997' },
        { name: 'Instagram Memorialization', url: 'https://help.instagram.com/contact/1474899482730688' },
        { name: 'LinkedIn Profile Removal', url: 'https://www.linkedin.com/help/linkedin/answer/2842' },
        { name: 'Twitter Account Deactivation', url: 'https://help.twitter.com/forms/contact' }
      ]
    },
    {
      category: 'Email Providers',
      resources: [
        { name: 'Google Inactive Account Manager', url: 'https://support.google.com/accounts/answer/3036546' },
        { name: 'Microsoft Account Closure', url: 'https://support.microsoft.com/account-billing' },
        { name: 'Apple ID for Deceased', url: 'https://support.apple.com/deceased' }
      ]
    }
  ];

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
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <span className="text-2xl font-playfair font-normal text-foreground tracking-widest">HONORLY</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold text-foreground mb-3">Account Management Hub</h1>
            <p className="text-lg text-muted-foreground mb-6">
              A comprehensive guide to closing, transferring, and managing accounts after loss. 
              Find step-by-step instructions, letter templates, and resources for every type of account.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setActiveTab('guides')}>
                <BookOpen className="h-4 w-4 mr-2" />
                View Step-by-Step Guides
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('templates')}>
                <FileText className="h-4 w-4 mr-2" />
                Get Letter Templates
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guides">Step-by-Step</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Action Cards */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Where to Start</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <CardTitle className="text-lg">Financial Accounts First</CardTitle>
                    <CardDescription>
                      Banks and credit cards need immediate attention to prevent fraud and ensure account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="destructive"
                      onClick={() => setActiveTab('guides')}
                    >
                      View Financial Guide
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <Badge>Recommended</Badge>
                    </div>
                    <CardTitle className="text-lg">Use Our Templates</CardTitle>
                    <CardDescription>
                      Pre-written letters make it easier to notify banks, credit card companies, and other institutions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full"
                      onClick={() => setActiveTab('templates')}
                    >
                      Get Templates
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <Badge variant="outline">Helpful</Badge>
                    </div>
                    <CardTitle className="text-lg">Create an Inventory</CardTitle>
                    <CardDescription>
                      Start by listing all accounts you know about, then use statements to find others
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={async () => {
                        if (lovedOneId && user) {
                          await navigateToCaseByLovedOne(lovedOneId, user.id, navigate, '?tab=tasks');
                        }
                      }}
                    >
                      Go to Task List
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Account Categories */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Account Categories</h2>
              <p className="text-muted-foreground mb-6">
                Different types of accounts have different closure processes. Click each category to learn more.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {accountCategories.map((category) => (
                  <Card key={category.id} className={`border-2 ${category.color}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                            {category.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{category.title}</CardTitle>
                              <Badge variant={category.priority === 'Critical' ? 'destructive' : 'secondary'}>
                                {category.priority}
                              </Badge>
                            </div>
                            <CardDescription>{category.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Common accounts:</p>
                          <div className="flex flex-wrap gap-2">
                            {category.accounts.map((account) => (
                              <Badge key={account} variant="outline" className="text-xs">
                                {account}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setActiveTab('guides')}
                        >
                          View Closure Process
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Important Documents */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Documents You'll Need</CardTitle>
                <CardDescription>Have these ready when contacting institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Certified Death Certificate</p>
                        <p className="text-sm text-muted-foreground">Order 10-15 copies - most institutions require originals</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Letters Testamentary / Letters of Administration</p>
                        <p className="text-sm text-muted-foreground">Court documents proving your authority to act</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Your Government-Issued ID</p>
                        <p className="text-sm text-muted-foreground">Driver's license or passport</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Account Statements</p>
                        <p className="text-sm text-muted-foreground">Recent statements showing account numbers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Proof of Relationship</p>
                        <p className="text-sm text-muted-foreground">Marriage certificate, birth certificate, etc.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Will or Trust Documents</p>
                        <p className="text-sm text-muted-foreground">If applicable</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step-by-Step Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Step-by-Step Guides</h2>
              <p className="text-muted-foreground">
                Detailed instructions for handling different types of accounts
              </p>
            </div>

            {stepByStepGuides.map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {guide.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{guide.category}</CardTitle>
                      <CardDescription>Follow these steps in order</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {guide.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="relative pl-8">
                        {/* Step number */}
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {stepIndex + 1}
                        </div>
                        {/* Connecting line */}
                        {stepIndex < guide.steps.length - 1 && (
                          <div className="absolute left-3 top-6 w-0.5 h-full bg-border" />
                        )}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{step.title}</h4>
                          <p className="text-muted-foreground">{step.description}</p>
                          {step.tips && step.tips.length > 0 && (
                            <div className="mt-3 bg-muted/50 rounded-lg p-4">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Tips:
                              </p>
                              <ul className="space-y-1">
                                {step.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Notification Letter Templates</h2>
              <p className="text-muted-foreground">
                Copy these templates and fill in your specific information
              </p>
            </div>

            {notificationTemplates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTemplate(template.template)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-foreground">
                      {template.template}
                    </pre>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([template.template], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${template.title.replace(/\s+/g, '_')}.txt`;
                        a.click();
                        toast.success('Template downloaded');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Before sending:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Replace all bracketed [placeholders] with your actual information</li>
                      <li>• Include all required documentation as mentioned in each letter</li>
                      <li>• Send via certified mail when possible for proof of delivery</li>
                      <li>• Keep copies of all correspondence for your records</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Official Resources & Links</h2>
              <p className="text-muted-foreground">
                Direct links to account closure and memorialization pages
              </p>
            </div>

            {resourceLinks.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.resources.map((resource, resourceIndex) => (
                      <div
                        key={resourceIndex}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{resource.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          Visit
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>Additional Help</CardTitle>
                <CardDescription>More resources for account management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Government Resources</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Federal Trade Commission - Identity Theft Protection</li>
                      <li>• Social Security Administration - Reporting a Death</li>
                      <li>• IRS - Filing Final Tax Returns</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Industry Organizations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• American Bankers Association</li>
                      <li>• Credit Union National Association</li>
                      <li>• National Association of Insurance Commissioners</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
