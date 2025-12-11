// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Replace with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-R54Y58T3MJ';

export const analytics = {
  // Track page views
  pageView: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  },

  // Track custom events
  event: (action: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: 'engagement',
        event_label: 'honorly_platform',
        ...parameters,
      });
    }
  },

  // Track support after loss progress
  trackSupportProgress: (questionNumber: number, totalQuestions: number, module: string) => {
    analytics.event('support_progress', {
      question_number: questionNumber,
      total_questions: totalQuestions,
      module: module,
      progress_percentage: Math.round((questionNumber / totalQuestions) * 100),
    });
  },

  // Track assessment completion
  trackAssessmentComplete: (totalAnswers: number, timeSpent?: number) => {
    analytics.event('assessment_complete', {
      total_answers: totalAnswers,
      time_spent_seconds: timeSpent,
      value: 1,
    });
  },

  // Track user registration
  trackSignUp: (method: string = 'email') => {
    analytics.event('sign_up', {
      method: method,
      value: 1,
    });
  },

  // Track user login
  trackLogin: (method: string = 'email') => {
    analytics.event('login', {
      method: method,
    });
  },

  // Track roadmap generation
  trackRoadmapGenerated: (answersCount: number) => {
    analytics.event('roadmap_generated', {
      answers_count: answersCount,
      value: 1,
    });
  },

  // Track button clicks for important actions
  trackButtonClick: (buttonName: string, location: string) => {
    analytics.event('button_click', {
      button_name: buttonName,
      location: location,
    });
  },
};