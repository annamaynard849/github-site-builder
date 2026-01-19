import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { US_STATES } from '@/data/usStates';
import { getQuestionsByPath } from '@/lib/onboarding/questions';
import { generatePersonalizedTasks } from '@/lib/onboarding/plan';
import { Upload, ChevronLeft, ChevronRight, Heart, Sparkles, Check } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  path: 'recent-loss' | 'planning-ahead';
  userId: string;
  onComplete?: (caseId: string) => void;
}

interface Answers {
  relationship_to_deceased?: string;
  loved_one_name?: { first_name?: string; last_name?: string };
  photo?: File;
  date_of_death?: string;
  jurisdiction?: { state?: string; county?: string };
  care_status?: string;
  dependents_status?: string;
  notifications_status?: string;
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
  const [direction, setDirection] = useState(1);

  const questions = getQuestionsByPath(path);
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = async () => {
    setDirection(1);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleFinish();
    }
  };

  const handleSkip = () => {
    setDirection(1);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      let lovedOneData: any = {
        admin_user_id: userId,
      };

      if (path === 'recent-loss') {
        lovedOneData.first_name = answers.loved_one_name?.first_name || 'Loved';
        lovedOneData.last_name = answers.loved_one_name?.last_name || 'One';
        lovedOneData.relationship_to_user = answers.relationship_to_deceased;
        
        if (answers.date_of_death) {
          lovedOneData.date_of_death = answers.date_of_death;
        }

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

      const { data: lovedOne, error: lovedOneError } = await supabase
        .from('loved_ones')
        .insert([lovedOneData])
        .select()
        .single();

      if (lovedOneError) throw lovedOneError;

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

      await generatePersonalizedTasks(answers, lovedOne.id, userId);

      toast({
        title: 'Setup complete',
        description: 'Your personalized plan has been created.',
      });

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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const renderQuestion = () => {
    const value = answers[currentQuestion.id as keyof Answers];

    if (currentQuestion.type === 'name_input') {
      const nameValue = value as { first_name?: string; last_name?: string } | undefined;
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name" className="text-sm font-medium text-foreground">First Name *</Label>
            <Input
              id="first_name"
              type="text"
              value={nameValue?.first_name ?? ''}
              onChange={(e) => handleAnswer({ ...nameValue, first_name: e.target.value })}
              placeholder="Enter first name"
              className="mt-2 h-12 text-base"
            />
          </div>
          <div>
            <Label htmlFor="last_name" className="text-sm font-medium text-foreground">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              value={nameValue?.last_name ?? ''}
              onChange={(e) => handleAnswer({ ...nameValue, last_name: e.target.value })}
              placeholder="Enter last name (optional)"
              className="mt-2 h-12 text-base"
            />
          </div>
        </div>
      );
    }

    if (currentQuestion.type === 'photo_upload') {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20 shadow-lg" 
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                </div>
              ) : (
                <label 
                  htmlFor="photo-upload"
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center cursor-pointer hover:from-primary/10 hover:to-secondary transition-all duration-300 ring-2 ring-border"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </label>
              )}
            </motion.div>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="max-w-xs cursor-pointer"
            />
            <p className="text-sm text-muted-foreground text-center">
              A photo helps personalize your experience
            </p>
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
            <SelectTrigger className="h-12 text-base">
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
      const options = currentQuestion.options || [];
      const useCompactLayout = options.length > 4;
      
      return (
        <div className={`space-y-2 ${useCompactLayout ? 'max-h-[240px] overflow-y-auto pr-2' : ''}`}>
          {options.map((opt, index) => (
            <motion.button
              key={opt}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handleAnswer(opt)}
              className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                value === opt 
                  ? 'border-primary bg-primary/5 text-foreground shadow-sm' 
                  : 'border-border hover:border-primary/40 hover:bg-secondary/50 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  value === opt ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                }`}>
                  {value === opt && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 bg-primary-foreground rounded-full"
                    />
                  )}
                </div>
                <span className="text-sm">{opt}</span>
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    if (currentQuestion.type === 'date') {
      return (
        <Input
          type="date"
          value={value as string ?? ''}
          onChange={(e) => handleAnswer(e.target.value)}
          className="h-12 text-base"
        />
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-card max-h-[90vh]">
        {/* Header with gradient */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-secondary/30 to-background">
          <div className="flex items-center gap-2 mb-1">
            {path === 'recent-loss' ? (
              <Heart className="w-4 h-4 text-primary" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary" />
            )}
            <span className="text-xs font-medium text-primary">
              {path === 'recent-loss' ? 'Loss Support Setup' : 'Planning Ahead'}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground font-playfair">
            Let's personalize your experience
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your answers help us provide the most relevant support.
          </p>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-xs font-medium text-primary">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Question content with animation */}
        <div className="px-6 py-4 min-h-[220px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-base font-medium text-foreground">
                  {currentQuestion.label}
                </h3>
                {currentQuestion.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with actions */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={saving}
                className="gap-1 min-w-[100px]"
              >
                {saving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {currentStep === questions.length - 1 ? 'Finish' : 'Continue'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
