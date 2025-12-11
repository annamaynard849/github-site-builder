import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Type, 
  Layout, 
  Music, 
  Heart, 
  Calendar,
  Quote,
  Star,
  Plus,
  X,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface MemorialCustomizationProps {
  memorialId: string;
  currentSettings: any;
  onUpdate: (settings: any) => void;
}

interface TimelineEvent {
  id?: string;
  event_date: string;
  event_title: string;
  event_description: string;
}

interface Quote {
  id?: string;
  quote_text: string;
  author: string;
  category: string;
}

interface Favorite {
  id?: string;
  category: string;
  item_name: string;
  item_description: string;
}

export const MemorialCustomization = ({ 
  memorialId, 
  currentSettings, 
  onUpdate 
}: MemorialCustomizationProps) => {
  const [settings, setSettings] = useState(currentSettings);
  const [saving, setSaving] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  
  // Form states for new items
  const [newEvent, setNewEvent] = useState<TimelineEvent>({
    event_date: '',
    event_title: '',
    event_description: ''
  });
  const [newQuote, setNewQuote] = useState<Quote>({
    quote_text: '',
    author: '',
    category: 'inspirational'
  });
  const [newFavorite, setNewFavorite] = useState<Favorite>({
    category: 'food',
    item_name: '',
    item_description: ''
  });

  useEffect(() => {
    fetchCustomContent();
  }, [memorialId]);

  const fetchCustomContent = async () => {
    try {
      // Fetch timeline events
      const { data: timelineData } = await supabase
        .from('memorial_timeline')
        .select('*')
        .eq('memorial_page_id', memorialId)
        .order('event_date', { ascending: true });
      
      // Fetch quotes
      const { data: quotesData } = await supabase
        .from('memorial_quotes')
        .select('*')
        .eq('memorial_page_id', memorialId)
        .order('created_at', { ascending: false });
      
      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from('memorial_favorites')
        .select('*')
        .eq('memorial_page_id', memorialId)
        .order('category', { ascending: true });

      setTimelineEvents(timelineData || []);
      setQuotes(quotesData || []);
      setFavorites(favoritesData || []);
    } catch (error) {
      console.error('Error fetching custom content:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('memorial_pages')
        .update(settings)
        .eq('id', memorialId);

      if (error) throw error;

      onUpdate(settings);
      toast.success('Memorial settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setSaving(true);
      const newPublishStatus = !settings.is_public;
      
      const { error } = await supabase
        .from('memorial_pages')
        .update({ is_public: newPublishStatus })
        .eq('id', memorialId);

      if (error) throw error;

      setSettings(prev => ({ ...prev, is_public: newPublishStatus }));
      onUpdate({ ...settings, is_public: newPublishStatus });
      
      toast.success(
        newPublishStatus 
          ? 'Memorial page is now live and publicly accessible!' 
          : 'Memorial page is now private'
      );
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimelineEvent = async () => {
    if (!newEvent.event_title || !newEvent.event_date) return;

    try {
      const { error } = await supabase
        .from('memorial_timeline')
        .insert({
          memorial_page_id: memorialId,
          ...newEvent
        });

      if (error) throw error;

      setNewEvent({ event_date: '', event_title: '', event_description: '' });
      await fetchCustomContent();
      toast.success('Timeline event added');
    } catch (error) {
      console.error('Error adding timeline event:', error);
      toast.error('Failed to add timeline event');
    }
  };

  const handleAddQuote = async () => {
    if (!newQuote.quote_text) return;

    try {
      const { error } = await supabase
        .from('memorial_quotes')
        .insert({
          memorial_page_id: memorialId,
          ...newQuote
        });

      if (error) throw error;

      setNewQuote({ quote_text: '', author: '', category: 'inspirational' });
      await fetchCustomContent();
      toast.success('Quote added');
    } catch (error) {
      console.error('Error adding quote:', error);
      toast.error('Failed to add quote');
    }
  };

  const handleAddFavorite = async () => {
    if (!newFavorite.item_name) return;

    try {
      const { error } = await supabase
        .from('memorial_favorites')
        .insert({
          memorial_page_id: memorialId,
          ...newFavorite
        });

      if (error) throw error;

      setNewFavorite({ category: 'food', item_name: '', item_description: '' });
      await fetchCustomContent();
      toast.success('Favorite added');
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Failed to add favorite');
    }
  };

  const colorThemes = [
    { name: 'Ocean', value: '#3b82f6', gradient: 'from-blue-500 to-blue-700' },
    { name: 'Forest', value: '#10b981', gradient: 'from-emerald-500 to-emerald-700' },
    { name: 'Sunset', value: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
    { name: 'Lavender', value: '#8b5cf6', gradient: 'from-violet-500 to-purple-600' },
    { name: 'Rose', value: '#ec4899', gradient: 'from-pink-500 to-rose-600' },
    { name: 'Sage', value: '#6b7280', gradient: 'from-gray-500 to-slate-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Customize Memorial Page</h2>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Publish Status and Controls */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${settings.is_public ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <h3 className="font-semibold">
                  {settings.is_public ? 'Memorial is Live' : 'Memorial is Private'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {settings.is_public 
                    ? 'Your memorial page is publicly accessible and can be shared with others'
                    : 'Your memorial page is private and only visible to you'
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={handleTogglePublish}
              disabled={saving}
              variant={settings.is_public ? "destructive" : "default"}
              className="min-w-[120px]"
            >
              {saving ? 'Updating...' : settings.is_public ? 'Make Private' : 'Publish Live'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="design" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        {/* Design Tab */}
        <TabsContent value="design">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setSettings(prev => ({ ...prev, theme_color: theme.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.theme_color === theme.value 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <div className={`h-8 w-full rounded bg-gradient-to-r ${theme.gradient} mb-2`} />
                      <p className="text-sm font-medium">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Font Family</Label>
                  <Select
                    value={settings.font_family}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, font_family: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter (Modern)</SelectItem>
                      <SelectItem value="playfair">Playfair Display (Elegant)</SelectItem>
                      <SelectItem value="georgia">Georgia (Classic)</SelectItem>
                      <SelectItem value="merriweather">Merriweather (Warm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Layout Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Page Layout</Label>
                  <Select
                    value={settings.layout_style}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, layout_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="photo-focused">Photo Focused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Header Style</Label>
                  <Select
                    value={settings.header_style}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, header_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero Banner</SelectItem>
                      <SelectItem value="simple">Simple Header</SelectItem>
                      <SelectItem value="split">Split Layout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Memorial Music
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Background Music URL (optional)</Label>
                  <Input
                    placeholder="https://example.com/memorial-song.mp3"
                    value={settings.memorial_music_url || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, memorial_music_url: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Add a meaningful song that will play softly in the background
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Page Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Show Birth/Death Dates</Label>
                  <p className="text-sm text-muted-foreground">Display important dates in the header</p>
                </div>
                <Switch
                  checked={settings.show_dates}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_dates: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Life Timeline</Label>
                  <p className="text-sm text-muted-foreground">Show major life events chronologically</p>
                </div>
                <Switch
                  checked={settings.show_timeline}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_timeline: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Favorite Things</Label>
                  <p className="text-sm text-muted-foreground">Display their favorite foods, music, hobbies, etc.</p>
                </div>
                <Switch
                  checked={settings.show_favorites}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_favorites: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Memorable Quotes</Label>
                  <p className="text-sm text-muted-foreground">Share their favorite sayings or quotes about them</p>
                </div>
                <Switch
                  checked={settings.show_quotes}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_quotes: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base">Charity Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Charity Name</Label>
                    <Input
                      placeholder="Memorial Fund Name"
                      value={settings.charity_name || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, charity_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Charity URL</Label>
                    <Input
                      placeholder="https://charity-website.com"
                      value={settings.charity_url || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, charity_url: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Add Life Event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Event Title</Label>
                    <Input
                      placeholder="e.g., Graduated from University"
                      value={newEvent.event_title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, event_title: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Share details about this important moment..."
                    value={newEvent.event_description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, event_description: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddTimelineEvent} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Timeline Event
                </Button>
              </CardContent>
            </Card>

            {timelineEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Timeline Events ({timelineEvents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timelineEvents.map((event) => (
                      <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{event.event_title}</p>
                            <p className="text-sm text-muted-foreground">{event.event_date}</p>
                            {event.event_description && (
                              <p className="text-sm mt-1">{event.event_description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Add Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quote Text</Label>
                  <Textarea
                    placeholder="Share a meaningful quote or saying..."
                    value={newQuote.quote_text}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, quote_text: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Author</Label>
                    <Input
                      placeholder="Who said this?"
                      value={newQuote.author}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newQuote.category}
                      onValueChange={(value) => setNewQuote(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="funny">Funny</SelectItem>
                        <SelectItem value="wisdom">Wisdom</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddQuote} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quote
                </Button>
              </CardContent>
            </Card>

            {quotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quotes ({quotes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="p-3 bg-muted/50 rounded-lg">
                        <blockquote className="italic mb-2">&ldquo;{quote.quote_text}&rdquo;</blockquote>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>— {quote.author || 'Unknown'}</span>
                          <span className="capitalize">{quote.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Add Favorite Thing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newFavorite.category}
                      onValueChange={(value) => setNewFavorite(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food & Drinks</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="movies">Movies & TV</SelectItem>
                        <SelectItem value="hobbies">Hobbies</SelectItem>
                        <SelectItem value="places">Places</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      placeholder="e.g., Chocolate cake, Mozart, Reading"
                      value={newFavorite.item_name}
                      onChange={(e) => setNewFavorite(prev => ({ ...prev, item_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Tell us more about why this was special..."
                    value={newFavorite.item_description}
                    onChange={(e) => setNewFavorite(prev => ({ ...prev, item_description: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddFavorite} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Favorite
                </Button>
              </CardContent>
            </Card>

            {favorites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Things ({favorites.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{favorite.item_name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{favorite.category.replace('_', ' ')}</p>
                            {favorite.item_description && (
                              <p className="text-sm mt-1">{favorite.item_description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};