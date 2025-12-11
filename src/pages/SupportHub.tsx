import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  ArrowLeft,
  Lightbulb,
  Clock,
  AlertCircle,
  BookMarked,
  TrendingUp,
  Sparkles,
  Wind,
  Smile,
  ExternalLink
} from 'lucide-react';

export default function SupportHub() {
  const navigate = useNavigate();

  const tools = [
    {
      title: 'Grief Journal',
      description: 'Express your thoughts and feelings in a private, safe space',
      icon: BookMarked,
      action: 'Start Writing',
      color: 'primary',
      route: '/grief-journal'
    },
    {
      title: 'Mood Tracker',
      description: 'Track your emotions over time and identify patterns',
      icon: TrendingUp,
      action: 'Track Mood',
      color: 'primary',
      route: '/mood-tracker'
    },
    {
      title: 'Guided Exercises',
      description: 'Breathing exercises, meditation, and mindfulness practices',
      icon: Wind,
      action: 'Start Exercise',
      color: 'primary',
      route: '/guided-exercises'
    },
    {
      title: 'AI Support Chat',
      description: 'Talk to your compassionate AI companion anytime',
      icon: MessageCircle,
      action: 'Start Conversation',
      color: 'primary',
      route: '/chat'
    }
  ];

  const quickTips = [
    {
      title: 'Allow Yourself to Feel',
      description: 'All emotions are valid. There\'s no right or wrong way to grieve.',
      icon: Heart
    },
    {
      title: 'Take Your Time',
      description: 'Healing isn\'t linear. Honor your own pace and process.',
      icon: Clock
    },
    {
      title: 'Practice Self-Compassion',
      description: 'Be gentle with yourself. Self-care isn\'t selfish.',
      icon: Sparkles
    },
    {
      title: 'Connect When Ready',
      description: 'Reach out to others when you feel ready. You don\'t have to do this alone.',
      icon: Smile
    }
  ];

  const resources = [
    {
      category: 'Professional Support',
      items: [
        { name: 'BetterHelp', description: 'Online therapy platform', url: 'https://www.betterhelp.com' },
        { name: 'Psychology Today', description: 'Find a therapist directory', url: 'https://www.psychologytoday.com' },
        { name: 'GriefShare', description: 'Grief support groups', url: 'https://www.griefshare.org' }
      ]
    },
    {
      category: 'Reading & Learning',
      items: [
        { name: 'Understanding Grief Stages', description: 'Learn about the grief process', url: '#' },
        { name: 'Self-Care Guide', description: 'Practical tips for difficult days', url: '#' },
        { name: 'Supporting Others', description: 'How to help someone who\'s grieving', url: '#' }
      ]
    }
  ];

  const crisisResources = [
    { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988', phone: '988' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', phone: '741741' },
    { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', phone: '1-800-662-4357' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Support Tools & Resources</h1>
            <p className="text-muted-foreground text-lg">
              Personal tools, guided practices, and supportive resources for your healing journey
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="tools" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="tools">Your Tools</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="crisis">Crisis Help</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-8">
            {/* Welcome Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Your Personal Support Toolkit</CardTitle>
                <CardDescription className="text-base">
                  These tools are here to help you process, reflect, and find moments of peace. 
                  Use them whenever you need support—there's no right or wrong way to grieve.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Interactive Tools */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Interactive Tools</h2>
                  <p className="text-muted-foreground">Personal spaces for reflection and healing</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {tools.map((tool) => (
                  <Card key={tool.title} className="group hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <tool.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{tool.title}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full"
                        onClick={() => navigate(tool.route)}
                      >
                        {tool.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator />

            {/* Quick Tips */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Gentle Reminders</h2>
                  <p className="text-muted-foreground">Small truths for difficult days</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickTips.map((tip) => (
                  <Card key={tip.title}>
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <tip.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-sm">{tip.title}</CardTitle>
                      <CardDescription className="text-xs">{tip.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>

            {/* Crisis Banner */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6 flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-1">Need immediate help?</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Crisis support is available 24/7. You can call or text 988 anytime.
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => window.open('tel:988', '_self')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call 988 Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-8">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-2xl">External Resources</CardTitle>
                <CardDescription className="text-base">
                  Professional support, communities, and educational materials
                </CardDescription>
              </CardHeader>
            </Card>

            {resources.map((section) => (
              <section key={section.category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{section.category}</h2>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <Card key={item.name}>
                      <CardHeader>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <CardDescription className="text-sm">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => item.url !== '#' && window.open(item.url, '_blank')}
                        >
                          Learn More
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </TabsContent>

          {/* Crisis Help Tab */}
          <TabsContent value="crisis" className="space-y-8">
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-2xl">You're Not Alone - Help is Available</CardTitle>
                <CardDescription className="text-base">
                  If you're in crisis or experiencing thoughts of self-harm, please reach out. 
                  These resources provide free, confidential support 24 hours a day, 7 days a week.
                </CardDescription>
              </CardHeader>
            </Card>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Immediate Support</h2>
                  <p className="text-muted-foreground">Available 24/7 - Call or text anytime</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {crisisResources.map((resource) => (
                  <Card key={resource.name} className="border-destructive/20">
                    <CardHeader>
                      <Phone className="h-6 w-6 text-destructive mb-2" />
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => window.open(`tel:${resource.phone}`, '_self')}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {resource.contact}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Card className="border-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> If you're experiencing a medical emergency, 
                  please call 911 or go to your nearest emergency room immediately.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
