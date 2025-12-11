import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { US_STATES } from '@/data/usStates';
import { getQuestionsByPath } from '@/lib/onboarding/questions';
import { generatePersonalizedTasks } from '@/lib/onboarding/plan';
import { Upload } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  path: 'recent-loss' | 'planning-ahead';
  userId: string;
  onComplete?: (caseId: string) => void;
}

interface Answers {
  // Recent Loss answers
  relationship_to_deceased?: string;
  loved_one_name?: { first_name?: string; last_name?: string };
  photo?: File;
  date_of_death?: string;
  jurisdiction?: { state?: string; county?: string };
  care_status?: string;
  dependents_status?: string;
  notifications_status?: string;
  // Planning Ahead answers
  planning_reason?: string;
  healthcare_directive?: string;
  will_status?: string;
}

export function OnboardingModal({ open, onClose, path, userId, onComplete }: OnboardingModalProps) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Answers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const questions = getQuestionsByPath(path);
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleFinish();
    }
  };

  const handleSkip = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Prepare loved one data based on path
      let lovedOneData: any = {
        admin_user_id: userId,
      };

      if (path === 'recent-loss') {
        // Use captured names from onboarding
        lovedOneData.first_name = answers.loved_one_name?.first_name || 'Loved';
        lovedOneData.last_name = answers.loved_one_name?.last_name || 'One';
        lovedOneData.relationship_to_user = answers.relationship_to_deceased;
        
        if (answers.date_of_death) {
          lovedOneData.date_of_death = answers.date_of_death;
        }

        // Upload photo if provided
        if (photoFile) {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('loved-one-photos')
            .upload(filePath, photoFile);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('loved-one-photos')
              .getPublicUrl(filePath);
            lovedOneData.photo_url = publicUrl;
          }
        }
      } else {
        // For planning ahead - use the logged-in user's profile info
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('user_id', userId)
          .maybeSingle();

        lovedOneData.first_name = userProfile?.first_name || 'My';
        lovedOneData.last_name = userProfile?.last_name || 'Plans';
        if (userProfile?.avatar_url) {
          lovedOneData.photo_url = userProfile.avatar_url;
        }
      }

      // Create a new loved one record
      const { data: lovedOne, error: lovedOneError } = await supabase
        .from('loved_ones')
        .insert([lovedOneData])
        .select()
        .single();

      if (lovedOneError) throw lovedOneError;

      // Save onboarding answers (exclude photo file from JSON)
      const { photo, ...answersToSave } = answers;
      const payload = {
        user_id: userId,
        loved_one_id: lovedOne.id,
        answers_json: answersToSave as any,
        completion_pct: Math.round((Object.keys(answers).length / questions.length) * 100),
      };

      const { error: answersError } = await supabase
        .from('onboarding_answers')
        .insert([payload]);

      if (answersError) throw answersError;

      // Create a case for this loved one
      const { data: newCase, error: caseError } = await (supabase as any)
        .from('cases')
        .insert([{
          loved_one_id: lovedOne.id,
          user_id: userId,
          type: path === 'recent-loss' ? 'LOSS' : 'PREPLAN',
          status: 'active'
        }])
        .select()
        .single();

      if (caseError) throw caseError;

      // Generate personalized tasks
      await generatePersonalizedTasks(answers, lovedOne.id, userId);

      toast({
        title: 'Setup complete',
        description: 'Your personalized plan has been created.',
      });

      // Navigate to the new case dashboard
      if (onComplete && newCase) {
        onComplete(newCase.id);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleAnswer(file);
    }
  };

  const renderQuestion = () => {
    const value = answers[currentQuestion.id as keyof Answers];

    // Combined name input question
    if (currentQuestion.type === 'name_input') {
      const nameValue = value as { first_name?: string; last_name?: string } | undefined;
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              type="text"
              value={nameValue?.first_name ?? ''}
              onChange={(e) => handleAnswer({ ...nameValue, first_name: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              value={nameValue?.last_name ?? ''}
              onChange={(e) => handleAnswer({ ...nameValue, last_name: e.target.value })}
              placeholder="Enter last name (optional)"
            />
          </div>
        </div>
      );
    }

    // Photo upload question
    if (currentQuestion.type === 'photo_upload') {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="max-w-xs"
            />
          </div>
        </div>
      );
    }

    if (currentQuestion.type === 'location' || currentQuestion.type === 'date_or_unknown') {
      const locationValue = value as { state?: string; county?: string } | undefined;
      return (
        <div className="space-y-4">
          <Select 
            value={locationValue?.state ?? ''} 
            onValueChange={(state) => handleAnswer({ state, county: '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (currentQuestion.type === 'single_select') {
      return (
        <Select value={value as string ?? ''} onValueChange={handleAnswer}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {currentQuestion.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (currentQuestion.type === 'date') {
      return (
        <Input
          type="date"
          value={value as string ?? ''}
          onChange={(e) => handleAnswer(e.target.value)}
        />
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Let's understand your situation</DialogTitle>
          <DialogDescription>
            This helps us provide the most relevant support for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-sm text-muted-foreground text-center">
            Question {currentStep + 1} of {questions.length}
          </div>

          <div className="space-y-4">
            <label className="text-base font-medium">{currentQuestion.label}</label>
            {renderQuestion()}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext} disabled={saving}>
                {currentStep === questions.length - 1 ? 'Continue' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
