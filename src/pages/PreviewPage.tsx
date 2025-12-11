import { useAuth } from '@/hooks/useAuth';
import { PublicLandingPage } from './PublicLandingPage';
import CaseSwitcher from './CaseSwitcher';
import HomeDashboard from './HomeDashboard';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const PreviewPage = () => {
  console.log('PreviewPage component loaded');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checkingCases, setCheckingCases] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  
  // Add meta tag to prevent indexing
  useEffect(() => {
    const metaTag = document.createElement('meta');
    metaTag.name = 'robots';
    metaTag.content = 'noindex,nofollow';
    document.head.appendChild(metaTag);
    
    return () => {
      document.head.removeChild(metaTag);
    };
  }, []);

  useEffect(() => {
    const checkUserCases = async () => {
      if (authLoading || !user || hasChecked) return;
      
      try {
        setCheckingCases(true);
        
        // Check owned cases
        const { data: ownedCases, error: ownedError } = await supabase
          .from('cases' as any)
          .select('id')
          .eq('user_id', user.id) as any;

        if (ownedError) throw ownedError;

        // Check support access
        const { data: supportAccess, error: supportError } = await supabase
          .from('loved_one_access')
          .select('loved_one_id')
          .eq('user_id', user.id);

        if (supportError) throw supportError;

        const totalCases = (ownedCases?.length || 0) + (supportAccess?.length || 0);

        setHasChecked(true);

        // Route based on number of cases
        if (totalCases === 0) {
          // No cases - stay on this page, will show HomeDashboard
          setCheckingCases(false);
        } else if (totalCases === 1 && ownedCases && ownedCases.length === 1) {
          // Single owned case - go directly to it
          navigate(`/cases/${ownedCases[0].id}`, { replace: true });
        } else {
          // Multiple cases or support access - show case switcher
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking cases:', error);
        setCheckingCases(false);
      }
    };

    checkUserCases();
  }, [user, authLoading, navigate, hasChecked]);
  
  try {
    console.log('Auth state:', { user: !!user, loading: authLoading });

    // Show loading while auth or cases are loading
    if (authLoading || (user && checkingCases)) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Show HomeDashboard for authenticated users with no cases
    if (user && !checkingCases) {
      return <HomeDashboard />;
    }

    // Show landing page for non-authenticated users
    return <PublicLandingPage />;
    
  } catch (error) {
    console.error('Error in PreviewPage component:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Page</h1>
          <p className="text-muted-foreground">Please check the console for details.</p>
        </div>
      </div>
    );
  }
};

export default PreviewPage;