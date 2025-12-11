import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { US_STATES } from '@/data/usStates';

interface LovedOneDetailsProps {
  lovedOneId: string;
  lovedOne: {
    first_name: string;
    last_name: string;
    photo_url: string | null;
    relationship_to_user: string | null;
    date_of_death: string | null;
  };
  onEdit?: () => void;
}

export function LovedOneDetails({ lovedOneId, lovedOne, onEdit }: LovedOneDetailsProps) {
  const [onboardingAnswers, setOnboardingAnswers] = useState<any>(null);

  useEffect(() => {
    fetchOnboardingAnswers();
  }, [lovedOneId]);

  const fetchOnboardingAnswers = async () => {
    try {
      const { data } = await supabase
        .from('onboarding_answers')
        .select('answers_json')
        .eq('loved_one_id', lovedOneId)
        .single();

      if (data) {
        setOnboardingAnswers(data.answers_json);
      }
    } catch (error) {
      console.error('Error fetching onboarding answers:', error);
    }
  };

  const getDisplayName = () => {
    if (lovedOne.relationship_to_user) {
      return lovedOne.relationship_to_user;
    }
    return `${lovedOne.first_name} ${lovedOne.last_name}`;
  };

  const getLocationDisplay = () => {
    if (onboardingAnswers?.jurisdiction?.state) {
      const state = US_STATES.find(s => s.code === onboardingAnswers.jurisdiction.state);
      return state?.name || onboardingAnswers.jurisdiction.state;
    }
    return null;
  };

  const getDateDisplay = () => {
    const dateOfDeath = lovedOne.date_of_death || onboardingAnswers?.date_of_death;
    if (dateOfDeath) {
      try {
        return format(new Date(dateOfDeath), 'MMMM d, yyyy');
      } catch {
        return dateOfDeath;
      }
    }
    return null;
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-6 space-y-6">
        {/* Avatar and Name */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={lovedOne.photo_url || undefined} alt={getDisplayName()} />
            <AvatarFallback className="text-2xl bg-muted">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-1">
              {getDisplayName()}
            </h2>
          </div>
        </div>

        {/* Key Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Key Details (Optional for now)
          </h3>
          
          <div className="space-y-3">
            {getDateDisplay() ? (
              <div className="flex items-center gap-3 text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Date of passing: {getDateDisplay()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Date of passing</span>
              </div>
            )}

            {getLocationDisplay() ? (
              <div className="flex items-center gap-3 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Location: {getLocationDisplay()}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Location</span>
              </div>
            )}
          </div>
        </div>

        {/* Gentle Reminder Card */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400">☀️</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                  Remember to take breaks
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This is a lot to handle. It's okay to step away and come back later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">💙</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  We're here for you
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Talk to someone anytime, day or night. For urgent matters or just to talk.
                </p>
              </div>
            </div>
            <Button 
              variant="default" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                // Navigate to chat or support
                window.location.href = '/chat';
              }}
            >
              Start a conversation
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
