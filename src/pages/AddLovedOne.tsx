import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingAnswers } from '@/hooks/useOnboardingAnswers';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { getCaseIdForLovedOne } from '@/lib/case-utils';

export default function AddLovedOne() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userPath = searchParams.get('path') || 'recent-loss';
  const { answers } = useOnboardingAnswers();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    date_of_death: '',
    relationship_to_user: ''
  });

  // Prepopulate fields from onboarding answers
  useEffect(() => {
    if (answers.date_of_death) {
      setFormData(prev => ({ ...prev, date_of_death: answers.date_of_death || '' }));
    }
    if (answers.relationship_to_deceased) {
      // Map onboarding relationship to form values
      const relationshipMap: Record<string, string> = {
        'My parent': 'parent',
        'My grandparent': 'grandparent',
        'My spouse or partner': 'spouse',
        'My child': 'child',
        'My sibling': 'sibling',
        'My friend': 'friend',
        'Other': 'other'
      };
      const mappedRelationship = relationshipMap[answers.relationship_to_deceased] || 'other';
      setFormData(prev => ({ ...prev, relationship_to_user: mappedRelationship }));
    }
  }, [answers]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (lovedOneId: string): Promise<string | null> => {
    if (!photoFile || !user) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${user.id}/${lovedOneId}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('loved-one-photos')
        .upload(fileName, photoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('loved-one-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // double-submit guard
    
    console.log('Form submission started');
    console.log('User:', user);
    console.log('Form data:', formData);
    console.log('Photo file:', photoFile);
    
    if (!user) {
      console.error('No user found');
      toast.error('You must be logged in to create a loved one profile');
      return;
    }

    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || 
        !formData.date_of_death || !formData.relationship_to_user || !photoFile) {
      console.error('Missing required fields:', {
        first_name: !!formData.first_name,
        last_name: !!formData.last_name,
        date_of_birth: !!formData.date_of_birth,
        date_of_death: !!formData.date_of_death,
        relationship_to_user: !!formData.relationship_to_user,
        photoFile: !!photoFile
      });
      toast.error('Please fill in all required fields and upload a photo');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting database insert...');

      // First create the loved one record to get the ID
      const { data: lovedOneData, error: insertError } = await supabase
        .from('loved_ones')
        .insert({
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          date_of_death: formData.date_of_death,
          relationship_to_user: formData.relationship_to_user,
          admin_user_id: user.id
        })
        .select()
        .single();

      console.log('Insert result:', { data: lovedOneData, error: insertError });

      if (insertError) {
        const isDuplicate = (insertError as any).code === '23505' || (insertError as any).message?.includes('duplicate key value');
        if (isDuplicate) {
          // Try to find the existing record
          const { data: existing } = await supabase
            .from('loved_ones')
            .select('id, first_name, last_name')
            .eq('admin_user_id', user.id)
            .eq('first_name', formData.first_name)
            .eq('last_name', formData.last_name)
            .eq('date_of_birth', formData.date_of_birth)
            .eq('date_of_death', formData.date_of_death)
            .maybeSingle();

          if (existing) {
            toast('This loved one already exists', {
              description: `${existing.first_name} ${existing.last_name} is already in your list. View the existing profile?`,
              action: {
                label: 'View profile',
                onClick: () => {
                  window.location.href = `/dashboard/${existing.id}?tab=tasks`;
                },
              },
            });
          } else {
            toast('Duplicate profile', {
              description: 'A profile with the same details already exists.',
            });
          }
          return;
        }
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      // Upload photo and get URL
      console.log('Starting photo upload...');
      const photoUrl = await uploadPhoto(lovedOneData.id);
      console.log('Photo upload result:', photoUrl);

      // Update the record with the photo URL
      if (photoUrl) {
        console.log('Updating record with photo URL...');
        const { error: updateError } = await supabase
          .from('loved_ones')
          .update({ photo_url: photoUrl })
          .eq('id', lovedOneData.id);

        console.log('Update result:', updateError);
        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      }

      console.log('Profile created successfully!');
      
      toast.success('Loved one profile created successfully!');
      
      // Navigate to case dashboard - onboarding is handled via modal in HomeDashboard
      const caseId = await getCaseIdForLovedOne(lovedOneData.id, user.id);
      if (caseId) {
        navigate(`/cases/${caseId}`);
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Error creating loved one:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to create loved one profile: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Add Loved One</h1>
              <p className="text-muted-foreground">Create a profile for your loved one</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-4">
                <Label htmlFor="photo">Photo *</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    {photoPreview ? (
                      <AvatarImage src={photoPreview} alt="Preview" />
                    ) : (
                      <AvatarFallback>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="w-auto"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a photo of your loved one
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_death">Date of Death *</Label>
                  <Input
                    id="date_of_death"
                    type="date"
                    value={formData.date_of_death}
                    onChange={(e) => handleInputChange('date_of_death', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Relationship */}
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship to You *</Label>
                <Select 
                  value={formData.relationship_to_user}
                  onValueChange={(value) => handleInputChange('relationship_to_user', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="grandparent">Grandparent</SelectItem>
                    <SelectItem value="grandchild">Grandchild</SelectItem>
                    <SelectItem value="aunt_uncle">Aunt/Uncle</SelectItem>
                    <SelectItem value="cousin">Cousin</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}