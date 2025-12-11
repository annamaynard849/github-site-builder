import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Lock, MapPin, Upload, Download, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface LovedOne {
  id: string;
  first_name: string;
  last_name: string;
}

interface VaultDocument {
  id: string;
  name: string;
  type: string;
  file_url: string;
  uploaded_at: string;
}

interface VaultPassword {
  id: string;
  service_name: string;
  username: string;
  password: string;
  notes: string;
  created_at: string;
}

interface VaultDirection {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

export default function VaultPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { lovedOneId } = useParams();
  const [loading, setLoading] = useState(true);
  const [lovedOne, setLovedOne] = useState<LovedOne | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [passwords, setPasswords] = useState<VaultPassword[]>([]);
  const [directions, setDirections] = useState<VaultDirection[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVaultData();
  }, [user, lovedOneId]);

  const fetchVaultData = async () => {
    if (!user || !lovedOneId) return;

    try {
      setLoading(true);

      // Fetch loved one details
      const { data: lovedOneData } = await supabase
        .from('loved_ones')
        .select('id, first_name, last_name')
        .eq('id', lovedOneId)
        .single();

      if (lovedOneData) {
        setLovedOne(lovedOneData);
      }

      // TODO: Fetch actual vault data from database
      // For now using placeholder data
      setDocuments([]);
      setPasswords([]);
      setDirections([]);

    } catch (error) {
      console.error('Error fetching vault data:', error);
      toast({
        title: 'Error loading vault',
        description: 'Could not load vault data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Secure Vault</h1>
              {lovedOne && (
                <p className="text-muted-foreground">
                  {lovedOne.first_name} {lovedOne.last_name}'s important information
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Vault Content */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="passwords" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Passwords
            </TabsTrigger>
            <TabsTrigger value="directions" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Directions
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Important Documents</CardTitle>
                    <CardDescription>
                      Store wills, deeds, certificates, and other important files
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                          Upload an important document to the secure vault
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="doc-name">Document Name</Label>
                          <Input id="doc-name" placeholder="e.g., Last Will and Testament" />
                        </div>
                        <div>
                          <Label htmlFor="doc-type">Document Type</Label>
                          <Input id="doc-type" placeholder="e.g., Legal, Financial, Medical" />
                        </div>
                        <div>
                          <Label htmlFor="doc-file">File</Label>
                          <Input id="doc-file" type="file" />
                        </div>
                        <Button className="w-full">Upload</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload important documents to keep them safe and accessible
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Passwords Tab */}
          <TabsContent value="passwords" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Account Passwords</CardTitle>
                    <CardDescription>
                      Securely store login credentials for important accounts
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Password</DialogTitle>
                        <DialogDescription>
                          Store a secure password for an important account
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="service">Service Name</Label>
                          <Input id="service" placeholder="e.g., Bank of America" />
                        </div>
                        <div>
                          <Label htmlFor="username">Username/Email</Label>
                          <Input id="username" placeholder="email@example.com" />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Textarea id="notes" placeholder="Additional information..." />
                        </div>
                        <Button className="w-full">Save Password</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {passwords.length === 0 ? (
                  <div className="text-center py-12">
                    <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No passwords saved yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Store important account credentials securely
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {passwords.map((pwd) => (
                      <div
                        key={pwd.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pwd.service_name}</p>
                            <p className="text-sm text-muted-foreground">{pwd.username}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(pwd.id)}
                            >
                              {showPasswords[pwd.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Label className="text-xs">Password</Label>
                          <p className="font-mono text-sm">
                            {showPasswords[pwd.id] ? pwd.password : '••••••••••••'}
                          </p>
                        </div>
                        {pwd.notes && (
                          <div className="pt-2">
                            <Label className="text-xs">Notes</Label>
                            <p className="text-sm text-muted-foreground">{pwd.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Directions Tab */}
          <TabsContent value="directions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Important Directions</CardTitle>
                    <CardDescription>
                      Leave instructions for funeral arrangements, estate handling, and more
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Direction
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Direction</DialogTitle>
                        <DialogDescription>
                          Leave specific instructions or wishes
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="dir-title">Title</Label>
                          <Input id="dir-title" placeholder="e.g., Funeral Wishes" />
                        </div>
                        <div>
                          <Label htmlFor="dir-category">Category</Label>
                          <Input id="dir-category" placeholder="e.g., Funeral, Estate, Medical" />
                        </div>
                        <div>
                          <Label htmlFor="dir-content">Instructions</Label>
                          <Textarea
                            id="dir-content"
                            placeholder="Write your detailed instructions here..."
                            className="min-h-[200px]"
                          />
                        </div>
                        <Button className="w-full">Save Direction</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {directions.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No directions saved yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave important instructions for your loved ones
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {directions.map((dir) => (
                      <div
                        key={dir.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{dir.title}</p>
                            <p className="text-sm text-muted-foreground">{dir.category}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{dir.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
