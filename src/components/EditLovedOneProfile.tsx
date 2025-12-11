import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LovedOne {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  date_of_death: string | null;
  photo_url: string | null;
  relationship_to_user: string | null;
  obituary: string | null;
  memorial_website_url: string | null;
}

interface EditLovedOneProfileProps {
  lovedOne: LovedOne;
  onUpdate: (updatedLovedOne: LovedOne) => void;
  trigger?: React.ReactNode;
}

export function EditLovedOneProfile({ lovedOne, onUpdate, trigger }: EditLovedOneProfileProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(lovedOne.photo_url || '');
  
  const [formData, setFormData] = useState({
    first_name: lovedOne.first_name,
    last_name: lovedOne.last_name,
    date_of_birth: lovedOne.date_of_birth || '',
    date_of_death: lovedOne.date_of_death || '',
    relationship_to_user: lovedOne.relationship_to_user || '',
    obituary: lovedOne.obituary || '',
    memorial_website_url: lovedOne.memorial_website_url || ''
  });

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

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return lovedOne.photo_url;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}/${lovedOne.id}.${fileExt}`;

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
    
    if (!formData.first_name || !formData.last_name) {
      toast({
        title: "Missing information",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Upload photo if a new one was selected
      const photoUrl = await uploadPhoto();

      // Update the loved one record
      const updateData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        date_of_death: formData.date_of_death || null,
        relationship_to_user: formData.relationship_to_user || null,
        obituary: formData.obituary || null,
        memorial_website_url: formData.memorial_website_url || null,
        photo_url: photoUrl
      };

      const { data: updatedLovedOne, error } = await supabase
        .from('loved_ones')
        .update(updateData)
        .eq('id', lovedOne.id)
        .select()
        .single();

      if (error) throw error;

      // Update parent component
      onUpdate(updatedLovedOne);

      toast({
        title: "Profile updated",
        description: "Loved one profile has been updated successfully",
        variant: "default"
      });

      setOpen(false);

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" data-edit-profile="true">
      <Edit className="h-4 w-4 mr-2" />
      Edit Profile
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-edit-profile="true">
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-4">
            <Label htmlFor="photo">Photo</Label>
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
                  Upload a new photo or keep existing
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
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
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_death">Date of Death</Label>
              <Input
                id="date_of_death"
                type="date"
                value={formData.date_of_death}
                onChange={(e) => handleInputChange('date_of_death', e.target.value)}
              />
            </div>
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship to You</Label>
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

          {/* Optional Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="obituary">Obituary</Label>
              <Textarea
                id="obituary"
                value={formData.obituary}
                onChange={(e) => handleInputChange('obituary', e.target.value)}
                placeholder="Share their story, achievements, and memories..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memorial_website">Memorial Website URL</Label>
              <Input
                id="memorial_website"
                type="url"
                value={formData.memorial_website_url}
                onChange={(e) => handleInputChange('memorial_website_url', e.target.value)}
                placeholder="https://example.com/memorial"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}