import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit3, 
  Save, 
  X, 
  Heart, 
  Camera, 
  MessageCircle, 
  Calendar,
  Share2,
  Upload,
  ArrowLeft,
  Sparkles,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { z } from 'zod';
import { MemorialCustomization } from '@/components/MemorialCustomization';

interface MemorialPage {
  id: string;
  slug: string;
  title: string | null;
  description: string | null;
  theme_color: string;
  background_image_url: string | null;
  is_public: boolean;
  layout_style: string;
  font_family: string;
  header_style: string;
  show_dates: boolean;
  show_timeline: boolean;
  show_favorites: boolean;
  show_quotes: boolean;
  memorial_music_url: string | null;
  charity_name: string | null;
  charity_url: string | null;
  loved_ones: {
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    date_of_death: string | null;
    photo_url: string | null;
    obituary: string | null;
  };
}

interface Memorial {
  id: string;
  file_url: string;
  caption: string | null;
  uploaded_by_name: string | null;
  memory_date: string | null;
  created_at: string;
}

interface Tribute {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

export default function MemorialPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [memorial, setMemorial] = useState<MemorialPage | null>(null);
  const [memories, setMemories] = useState<Memorial[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  
  // Custom content
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // New tribute state
  const [showTributeForm, setShowTributeForm] = useState(false);
  const [tributeAuthor, setTributeAuthor] = useState('');
  const [tributeMessage, setTributeMessage] = useState('');

  useEffect(() => {
    if (slug) {
      fetchMemorialData();
    }
  }, [slug]);

  const fetchMemorialData = async () => {
    try {
      setLoading(true);

      // Fetch memorial page
      const { data: memorialData, error: memorialError } = await supabase
        .from('memorial_pages')
        .select(`
          *,
          loved_ones (
            first_name,
            last_name,
            date_of_birth,
            date_of_death,
            photo_url,
            obituary,
            admin_user_id
          )
        `)
        .eq('slug', slug)
        .single();

      if (memorialError) throw memorialError;
      if (!memorialData) {
        navigate('/404');
        return;
      }

      setMemorial(memorialData);
      setEditTitle(memorialData.title || `${memorialData.loved_ones.first_name} ${memorialData.loved_ones.last_name}`);
      setEditDescription(memorialData.description || '');
      
      // Check if current user is the owner
      const isPageOwner = user && memorialData.loved_ones.admin_user_id === user.id;
      if (isPageOwner) {
        setIsOwner(true);
      }

      // Fetch memories and tributes using safe RPC functions for public access
      // This prevents email addresses from being exposed to public users
      const [{ data: memoriesData, error: memoriesError }, { data: tributesData, error: tributesError }] = await Promise.all([
        supabase
          .rpc('get_public_memorial_memories', { _memorial_page_id: memorialData.id }),
        supabase
          .rpc('get_public_tributes', { _memorial_page_id: memorialData.id })
      ]);

      if (memoriesError) throw memoriesError;
      if (tributesError) throw tributesError;

      setMemories(memoriesData || []);
      setTributes(tributesData || []);

      // Fetch custom content if sections are enabled
      if (memorialData.show_timeline) {
        const { data: timelineData } = await supabase
          .from('memorial_timeline')
          .select('*')
          .eq('memorial_page_id', memorialData.id)
          .order('event_date', { ascending: true });
        setTimelineEvents(timelineData || []);
      }

      if (memorialData.show_quotes) {
        const { data: quotesData } = await supabase
          .from('memorial_quotes')
          .select('*')
          .eq('memorial_page_id', memorialData.id)
          .order('created_at', { ascending: false });
        setQuotes(quotesData || []);
      }

      if (memorialData.show_favorites) {
        const { data: favoritesData } = await supabase
          .from('memorial_favorites')
          .select('*')
          .eq('memorial_page_id', memorialData.id)
          .order('category', { ascending: true });
        setFavorites(favoritesData || []);
      }

    } catch (error) {
      console.error('Error fetching memorial data:', error);
      toast.error('Error loading memorial page');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!memorial || !isOwner) return;

    try {
      const { error } = await supabase
        .from('memorial_pages')
        .update({
          title: editTitle,
          description: editDescription
        })
        .eq('id', memorial.id);

      if (error) throw error;

      setMemorial(prev => prev ? {
        ...prev,
        title: editTitle,
        description: editDescription
      } : null);

      setIsEditing(false);
      toast.success('Memorial page updated successfully');
    } catch (error) {
      console.error('Error updating memorial:', error);
      toast.error('Error updating memorial page');
    }
  };

  const handleAddTribute = async () => {
    if (!memorial) return;

    try {
      // Client-side validation with zod
      const tributeSchema = z.object({
        author_name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
        message: z.string().trim().min(1, 'Message is required').max(5000, 'Message must be less than 5000 characters')
      });

      const validated = tributeSchema.parse({
        author_name: tributeAuthor,
        message: tributeMessage
      });

      const { error } = await supabase
        .from('memorial_tributes')
        .insert({
          memorial_page_id: memorial.id,
          author_user_id: user?.id || null,
          author_name: validated.author_name,
          message: validated.message
        });

      if (error) throw error;

      setTributeAuthor('');
      setTributeMessage('');
      setShowTributeForm(false);
      await fetchMemorialData(); // Refresh to show new tribute
      toast.success('Tribute added successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error adding tribute:', error);
        toast.error('Error adding tribute');
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Memorial page link copied to clipboard');
    } catch (error) {
      toast.error('Unable to copy link');
    }
  };

  const handleCustomizationUpdate = (updatedSettings: any) => {
    setMemorial(prev => prev ? { ...prev, ...updatedSettings } : null);
  };

  const handleTogglePublish = async () => {
    if (!memorial || !isOwner) return;

    try {
      const newPublishStatus = !memorial.is_public;
      
      const { error } = await supabase
        .from('memorial_pages')
        .update({ is_public: newPublishStatus })
        .eq('id', memorial.id);

      if (error) throw error;

      setMemorial(prev => prev ? { ...prev, is_public: newPublishStatus } : null);
      
      toast.success(
        newPublishStatus 
          ? 'Memorial page is now live and publicly accessible!' 
          : 'Memorial page is now private'
      );
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const getFontClass = (fontFamily: string) => {
    switch (fontFamily) {
      case 'playfair': return 'font-playfair';
      case 'georgia': return 'font-serif';
      case 'merriweather': return 'font-serif';
      default: return 'font-sans';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading memorial page...</p>
        </div>
      </div>
    );
  }

  if (!memorial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Memorial Not Found</h1>
          <p className="text-muted-foreground">This memorial page does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${getFontClass(memorial.font_family)}`}
      style={{ 
        backgroundColor: memorial.background_image_url ? 'transparent' : undefined,
        backgroundImage: memorial.background_image_url ? `url(${memorial.background_image_url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '--theme-color': memorial.theme_color
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowCustomization(!showCustomization)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                  
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdits}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Publish Status Banner for Owners */}
        {isOwner && (
          <Card className={`border-l-4 ${memorial.is_public ? 'border-l-green-500 bg-green-50/50' : 'border-l-yellow-500 bg-yellow-50/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${memorial.is_public ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {memorial.is_public ? (
                        <>
                          <Globe className="h-4 w-4" />
                          Memorial is Live & Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Memorial is Private
                        </>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {memorial.is_public 
                        ? 'Your memorial page is publicly accessible and can be shared with others'
                        : 'Your memorial page is private and only visible to you. Click "Publish Live" to make it public.'
                      }
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleTogglePublish}
                  variant={memorial.is_public ? "destructive" : "default"}
                  size="sm"
                  className="min-w-[120px]"
                >
                  {memorial.is_public ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish Live
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customization Panel */}
        {showCustomization && isOwner && (
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <MemorialCustomization
                memorialId={memorial.id}
                currentSettings={memorial}
                onUpdate={handleCustomizationUpdate}
              />
            </CardContent>
          </Card>
        )}
        {/* Hero Section */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32">
                {memorial.loved_ones.photo_url ? (
                  <AvatarImage 
                    src={memorial.loved_ones.photo_url} 
                    alt={`${memorial.loved_ones.first_name} ${memorial.loved_ones.last_name}`}
                  />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {memorial.loved_ones.first_name[0]}{memorial.loved_ones.last_name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-3xl font-bold mb-2 text-center md:text-left"
                    placeholder="Memorial title"
                  />
                ) : (
                  <h1 className="text-3xl font-bold mb-2">{memorial.title || `${memorial.loved_ones.first_name} ${memorial.loved_ones.last_name}`}</h1>
                )}
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                  {memorial.show_dates && memorial.loved_ones.date_of_birth && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Born {format(new Date(memorial.loved_ones.date_of_birth), 'MMMM d, yyyy')}
                    </div>
                  )}
                  {memorial.show_dates && memorial.loved_ones.date_of_death && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(memorial.loved_ones.date_of_death), 'MMMM d, yyyy')}
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a description or tribute..."
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-lg leading-relaxed">
                    {memorial.description || memorial.loved_ones.obituary || "A beloved person who touched many lives."}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memories Section */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Camera className="h-6 w-6" />
                Memories ({memories.length})
              </h2>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Add Memory
              </Button>
            </div>
            
            {memories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="bg-muted/50 rounded-lg p-3">
                    <img 
                      src={memory.file_url} 
                      alt={memory.caption || 'Memory'} 
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                    {memory.caption && (
                      <p className="text-sm text-muted-foreground mb-1">{memory.caption}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Shared by {memory.uploaded_by_name || 'Anonymous'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No memories shared yet. Be the first to add a photo.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tributes Section */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-6 w-6" />
                Tributes ({tributes.length})
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTributeForm(true)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Leave Tribute
              </Button>
            </div>

            {/* Add Tribute Form */}
            {showTributeForm && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-3">Share a memory or tribute</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={tributeAuthor}
                    onChange={(e) => setTributeAuthor(e.target.value)}
                  />
                  <Textarea
                    placeholder="Share your memory, story, or tribute..."
                    value={tributeMessage}
                    onChange={(e) => setTributeMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddTribute}>
                      Post Tribute
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowTributeForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {tributes.length > 0 ? (
              <div className="space-y-4">
                {tributes.map((tribute) => (
                  <div key={tribute.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{tribute.author_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(tribute.created_at), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{tribute.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tributes yet. Share your memories to start the conversation.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}