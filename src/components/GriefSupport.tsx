import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';
import { ChatMessage } from './ChatMessage';
import { ChatOptions } from './ChatOptions';
import { RoadmapGenerator } from './RoadmapGenerator';
import balancedSupportPerson from '@/assets/balanced-support-person.jpg';
import { questions as onboardingQuestions, shouldShow } from '@/lib/onboarding/questions';

// Convert onboarding questions to chat format
const questions = onboardingQuestions.map((q, index) => ({
  id: index,
  message: q.label,
  options: q.options || [],
  questionId: q.id
}));

interface ChatHistoryItem {
  type: 'assistant' | 'user';
  message: string;
  timestamp: number;
}

export const GriefSupport = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [showCurrentQuestion, setShowCurrentQuestion] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load existing answers when component mounts
  useEffect(() => {
    const loadExistingAnswers = async () => {
      if (!user) return;

      try {
        const { data: existingAnswers, error } = await supabase
          .from('grief_support_answers' as any)
          .select('question_key, answer')
          .eq('user_id', user.id) as any;

        if (error) {
          console.error('Error loading answers:', error);
          return;
        }

        if (existingAnswers && existingAnswers.length > 0) {
          const answersMap: Record<number, string> = {};
          existingAnswers.forEach(item => {
            answersMap[parseInt(item.question_key)] = item.answer;
          });
          setAnswers(answersMap);

          // If user has answers, show welcome back message
          setChatHistory([{
            type: 'assistant',
            message: `Welcome back, ${user.user_metadata?.first_name || 'there'}! I see you've already started your support after loss assessment. Would you like to continue where you left off or start fresh?`,
            timestamp: Date.now()
          }]);
        } else {
          // First time user
          setChatHistory([{
            type: 'assistant',
            message: `Hello ${user.user_metadata?.first_name || 'there'}, I'm here to help you figure out what needs to be done next. I'll ask you a few questions to create a personalized checklist just for you. We can take this one step at a time.`,
            timestamp: Date.now()
          }]);
        }
      } catch (error) {
        console.error('Error loading answers:', error);
        setChatHistory([{
          type: 'assistant',
          message: `Hello ${user.user_metadata?.first_name || 'there'}, I'm here to help you figure out what needs to be done next. I'll ask you a few questions to create a personalized checklist just for you. We can take this one step at a time.`,
          timestamp: Date.now()
        }]);
      } finally {
        setLoadingAnswers(false);
      }
    };

    if (user) {
      loadExistingAnswers();
    }
  }, [user]);

  const getCurrentModule = () => {
    return "Onboarding Questions";
  };

  const progress = ((currentQuestion) / questions.length) * 100;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, showCurrentQuestion]);

  useEffect(() => {
    if (currentQuestion < questions.length) {
      const timer = setTimeout(() => {
        setShowCurrentQuestion(true);
        setChatHistory(prev => [...prev, {
          type: 'assistant',
          message: questions[currentQuestion].message,
          timestamp: Date.now()
        }]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion]);

  const saveAnswer = async (questionId: number, answer: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('grief_support_answers' as any)
        .upsert({
          user_id: user.id,
          question_key: questionId.toString(),
          answer: answer
        } as any);

      if (error) {
        console.error('Error saving answer:', error);
        toast({
          title: "Error saving answer",
          description: "We couldn't save your response. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleAnswer = async (answer: string) => {
    const questionId = questions[currentQuestion].id;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Save to database
    await saveAnswer(questionId, answer);

    // Track progress
    analytics.trackSupportProgress(
      currentQuestion + 1,
      questions.length,
      'onboarding'
    );

    // Add user response to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      message: answer,
      timestamp: Date.now()
    }]);

    setShowCurrentQuestion(false);

    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        analytics.trackAssessmentComplete(Object.keys(answers).length + 1);
        setShowResults(true);
      }
    }, 500);
  };

  const resetChat = async () => {
    if (!user) return;

    // Clear answers from database
    try {
      const { error } = await supabase
        .from('grief_support_answers' as any)
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing answers:', error);
      }
    } catch (error) {
      console.error('Error clearing answers:', error);
    }

    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setShowCurrentQuestion(false);
    setChatHistory([{
      type: 'assistant',
      message: `Hello ${user.user_metadata?.first_name || 'there'}, I'm here to help you figure out what needs to be done next. I'll ask you a few questions to create a personalized checklist just for you. We can take this one step at a time.`,
      timestamp: Date.now()
    }]);
  };

  const editAnswers = () => {
    setShowResults(false);
    setShowCurrentQuestion(false);
    // Keep existing answers and chat history, just go back to chat mode
  };

  // Show loading while checking auth or loading answers
  if (loading || loadingAnswers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  if (showResults) {
    return <RoadmapGenerator answers={answers} onStartOver={resetChat} onEditAnswers={editAnswers} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={balancedSupportPerson} 
                alt="Honorly team member" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-medium">Honorly team</h1>
              <p className="text-xs text-muted-foreground">Here to help you through this</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {getCurrentModule()} • {currentQuestion + 1} of {questions.length}
              </p>
              <div className="w-16 bg-muted rounded-full h-1 mt-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/'}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-1">
        {chatHistory.map((item, index) => (
          <ChatMessage 
            key={index}
            message={item.message}
            isUser={item.type === 'user'}
          />
        ))}
        
        {/* Current Question Options */}
        {showCurrentQuestion && currentQuestion < questions.length && (
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <ChatOptions
                options={questions[currentQuestion].options}
                onSelect={handleAnswer}
                className="mt-3"
              />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Placeholder for visual consistency) */}
      <div className="sticky bottom-0 bg-background border-t px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <input 
              type="text" 
              placeholder="Select an option above to continue..."
              disabled
              className="flex-1 bg-transparent border-none outline-none text-sm text-muted-foreground"
            />
            <Button size="sm" variant="ghost" disabled>
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};