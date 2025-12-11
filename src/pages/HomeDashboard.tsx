import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Calendar } from 'lucide-react';
import { OnboardingModal } from '@/components/OnboardingModal';

export default function HomeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [hasLovedOnes, setHasLovedOnes] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'recent-loss' | 'planning-ahead'>('recent-loss');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkLovedOnes();
  }, [user, navigate]);

  // Auto-open onboarding when requested via query param
  useEffect(() => {
    const qp = searchParams.get('showOnboarding');
    console.log('HomeDashboard: query showOnboarding =', qp);
    if (qp === 'preplan') {
      setSelectedPath('planning-ahead');
      setModalOpen(true);
      // Don't clear the param immediately; keep it for any redirects
    }
  }, [searchParams]);

  const checkLovedOnes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if user owns any loved ones
      const { data: ownedLovedOnes, error: ownedError } = await supabase
        .from('loved_ones')
        .select('id')
        .eq('admin_user_id', user.id);

      if (ownedError) throw ownedError;

      // Check if user has access to any loved ones
      const { data: accessData, error: accessError } = await supabase
        .from('loved_one_access')
        .select('loved_one_id')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      const hasAnyLovedOnes = (ownedLovedOnes && ownedLovedOnes.length > 0) || 
                               (accessData && accessData.length > 0);

      setHasLovedOnes(hasAnyLovedOnes);

      // If user has loved ones, redirect to main dashboard unless we're explicitly opening onboarding
      if (hasAnyLovedOnes && searchParams.get('showOnboarding') !== 'preplan') {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Error checking loved ones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePathSelection = (path: 'recent-loss' | 'planning-ahead') => {
    setSelectedPath(path);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    checkLovedOnes(); // Recheck after modal closes
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show path selection if no loved ones
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-foreground">Welcome to Honorly</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to support you. Please choose the path that best describes your situation:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Loss Path */}
          <Card 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary"
            onClick={() => handlePathSelection('recent-loss')}
          >
            <CardContent className="p-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Recent Loss</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Someone I love has recently passed away, and I need help navigating what comes next.
                </p>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePathSelection('recent-loss');
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Planning Ahead Path */}
          <Card 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary"
            onClick={() => handlePathSelection('planning-ahead')}
          >
            <CardContent className="p-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">Planning Ahead</h2>
                <p className="text-muted-foreground leading-relaxed">
                  I want to organize my own plans and wishes for the future to bring peace of mind.
                </p>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePathSelection('planning-ahead');
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          You can change or update your path at any time
        </p>
      </div>

      {user && (
        <OnboardingModal
          open={modalOpen}
          onClose={handleModalClose}
          path={selectedPath}
          userId={user.id}
          onComplete={(caseId: string) => {
            setModalOpen(false);
            navigate(`/cases/${caseId}?showProfile=1`);
          }}
        />
      )}
    </div>
  );
}
