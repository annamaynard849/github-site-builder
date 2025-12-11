import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Heart, BookOpen, CheckSquare, Image, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { navigateToCaseByLovedOne } from '@/lib/case-utils';

export default function MemorialHub() {
  const navigate = useNavigate();
  const { lovedOneId } = useParams();
  const { user } = useAuth();
  const [lovedOne, setLovedOne] = useState<any>(null);
  const [memorialPage, setMemorialPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && lovedOneId) {
      fetchData();
    }
  }, [user, lovedOneId]);

  const fetchData = async () => {
    try {
      // Fetch loved one
      const { data: lovedOneData } = await supabase
        .from('loved_ones')
        .select('*')
        .eq('id', lovedOneId)
        .single();

      setLovedOne(lovedOneData);

      // Fetch memorial page
      const { data: memorialData } = await supabase
        .from('memorial_pages')
        .select('*')
        .eq('loved_one_id', lovedOneId)
        .maybeSingle();

      setMemorialPage(memorialData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading memorial hub');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemorial = () => {
    navigate(`/dashboard/${lovedOneId}?tab=memorial`);
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
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-foreground mb-2">Memorial</h1>
              <p className="text-lg text-muted-foreground">
                Create a beautiful tribute to honor {lovedOne?.first_name}'s memory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="guide">Guide</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Memorial Status</CardTitle>
                <CardDescription>Track your memorial page progress</CardDescription>
              </CardHeader>
              <CardContent>
                {memorialPage ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Memorial Page Created</h3>
                        <p className="text-sm text-muted-foreground">Your memorial is live and ready to share</p>
                      </div>
                      <Button onClick={() => navigate(`/memorial/${memorialPage.slug}`)}>
                        View Memorial
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Photos & Memories</span>
                        </div>
                        <p className="text-2xl font-semibold">0</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Tributes</span>
                        </div>
                        <p className="text-2xl font-semibold">0</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Memorial Page Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a beautiful memorial page to honor their memory
                    </p>
                    <Button onClick={handleCreateMemorial}>
                      Create Memorial Page
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={handleCreateMemorial}>
                  <Calendar className="h-6 w-6" />
                  <span>Plan Service</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={handleCreateMemorial}>
                  <Image className="h-6 w-6" />
                  <span>Add Photos</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" onClick={handleCreateMemorial}>
                  <Users className="h-6 w-6" />
                  <span>Invite Contributors</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Memorial Planning Guide</CardTitle>
                <CardDescription>Step-by-step guidance for creating a meaningful memorial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: '1. Choose Your Memorial Type',
                    content: 'Decide between a funeral, celebration of life, memorial service, or a combination. Consider what would best honor their wishes and personality.'
                  },
                  {
                    title: '2. Select a Venue',
                    content: 'Options include funeral homes, churches, parks, family homes, or meaningful locations. Consider capacity, accessibility, and atmosphere.'
                  },
                  {
                    title: '3. Create the Service Program',
                    content: 'Plan readings, music, eulogies, and any special rituals. Include time for sharing memories and photos.'
                  },
                  {
                    title: '4. Notify Family and Friends',
                    content: 'Create a guest list, send invitations, and share memorial page details. Consider posting obituary notices.'
                  },
                  {
                    title: '5. Collect Memories',
                    content: 'Gather photos, videos, and stories from loved ones. Create a digital memorial or memory book.'
                  }
                ].map((step, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h3 className="font-medium mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Memorial Checklist</CardTitle>
                  <CardDescription>Essential tasks for memorial planning</CardDescription>
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
                    <CheckSquare className="h-4 w-4 mr-2" />
                    View Memorial Tasks
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Obituary Writer</CardTitle>
                  <CardDescription>AI-assisted obituary creation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Photo Organizer</CardTitle>
                  <CardDescription>Collect and organize memorial photos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleCreateMemorial}>
                    <Image className="h-4 w-4 mr-2" />
                    Manage Photos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest List Manager</CardTitle>
                  <CardDescription>Track attendees and RSVPs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" disabled>
                    <Users className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Planning a Funeral',
                  description: 'Complete guide to funeral planning, costs, and traditions',
                  link: '#'
                },
                {
                  title: 'Memorial Service Ideas',
                  description: 'Creative ways to celebrate and honor your loved one',
                  link: '#'
                },
                {
                  title: 'Writing an Obituary',
                  description: 'Tips and examples for writing a meaningful obituary',
                  link: '#'
                },
                {
                  title: 'Grief Support',
                  description: 'Resources for coping with loss during planning',
                  link: '#'
                }
              ].map((resource, index) => (
                <Card key={index} className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
