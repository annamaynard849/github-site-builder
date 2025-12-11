import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CurrentCaseProvider, useCurrentCase } from '@/contexts/CurrentCaseContext';
import MainDashboard from './MainDashboard';
import PlanningDashboard from './PlanningDashboard';

function CaseViewContent() {
  const { currentCase, loading, error } = useCurrentCase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && error) {
      navigate('/dashboard');
    }
  }, [loading, error, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!currentCase) {
    return null;
  }

  // Route to correct dashboard based on case type
  if (currentCase.type === 'PREPLAN') {
    return <PlanningDashboard />;
  } else {
    return <MainDashboard />;
  }
}

export default function CaseView() {
  const { caseId } = useParams<{ caseId: string }>();

  return (
    <CurrentCaseProvider caseId={caseId}>
      <CaseViewContent />
    </CurrentCaseProvider>
  );
}
