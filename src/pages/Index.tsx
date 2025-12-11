import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from './LandingPage';
import { HomeDashboard } from '@/components/HomeDashboard';

const Index = () => {
  console.log('Index component loaded');
  
  try {
    const { user, loading } = useAuth();
    console.log('Auth state:', { user: !!user, loading });

    // Show loading while auth is loading
    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Show home dashboard for authenticated users
    if (user) {
      return <HomeDashboard />;
    }

    // Show landing page for non-authenticated users
    return <LandingPage />;
    
  } catch (error) {
    console.error('Error in Index component:', error);
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

export default Index;
