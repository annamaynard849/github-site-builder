import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const moods = [
  { label: 'Sad', color: 'from-[hsl(210,25%,92%)] to-[hsl(210,20%,88%)]' },
  { label: 'Numb', color: 'from-[hsl(0,0%,92%)] to-[hsl(0,0%,88%)]' },
  { label: 'Lost', color: 'from-[hsl(210,15%,92%)] to-[hsl(210,15%,88%)]' },
  { label: 'Lonely', color: 'from-[hsl(240,12%,92%)] to-[hsl(240,10%,88%)]' },
  { label: 'Overwhelmed', color: 'from-[hsl(20,15%,92%)] to-[hsl(20,10%,88%)]' },
  { label: 'Heavy', color: 'from-[hsl(0,5%,90%)] to-[hsl(0,5%,86%)]' },
  { label: 'Exhausted', color: 'from-[hsl(240,10%,92%)] to-[hsl(240,10%,88%)]' },
  { label: 'Empty', color: 'from-[hsl(0,0%,93%)] to-[hsl(0,0%,89%)]' },
  { label: 'Missing Them', color: 'from-[hsl(340,20%,92%)] to-[hsl(340,15%,88%)]' },
  { label: 'Angry', color: 'from-[hsl(0,15%,90%)] to-[hsl(0,12%,86%)]' },
  { label: 'Anxious', color: 'from-[hsl(45,15%,92%)] to-[hsl(45,12%,88%)]' },
  { label: 'Confused', color: 'from-[hsl(200,12%,92%)] to-[hsl(200,10%,88%)]' },
  { label: 'Peaceful', color: 'from-[hsl(150,18%,92%)] to-[hsl(150,15%,88%)]' },
  { label: 'Grateful', color: 'from-[hsl(40,25%,92%)] to-[hsl(40,20%,88%)]' },
  { label: 'Hopeful', color: 'from-[hsl(180,15%,92%)] to-[hsl(180,12%,88%)]' },
  { label: 'Okay', color: 'from-[hsl(120,12%,92%)] to-[hsl(120,10%,88%)]' },
];

export default function EmotionalReflection() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showResources, setShowResources] = useState(false);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setTimeout(() => {
      setShowResources(true);
    }, 1500);
  };

  if (selectedMood && showResources) {
    return (
      <Card className="border-none bg-gradient-to-br from-[hsl(40,30%,97%)] via-card to-[hsl(35,25%,97%)] shadow-sm animate-fade-in">
        <CardContent className="py-12 px-8">
          <div className="text-center mb-8">
            <p className="text-xl font-playfair font-light text-foreground mb-2 animate-fade-in">
              It's okay to feel {selectedMood.toLowerCase()}.
            </p>
            <p className="text-sm text-muted-foreground font-light animate-fade-in" style={{ animationDelay: '100ms' }}>
              Take your time today.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-base font-playfair font-light text-foreground text-center mb-6">
              Resources for you
            </h3>
            
            <div className="grid gap-3">
              <button 
                onClick={() => window.location.href = '/chat'}
                className="group p-4 rounded-xl bg-card/50 border border-border/40 hover:border-border/60 hover:bg-card/70 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-light text-foreground mb-1">Talk to Support</p>
                    <p className="text-xs text-muted-foreground font-light">Get compassionate guidance anytime</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                className="group p-4 rounded-xl bg-card/50 border border-border/40 hover:border-border/60 hover:bg-card/70 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-light text-foreground mb-1">Grief Journal</p>
                    <p className="text-xs text-muted-foreground font-light">Write your thoughts and memories</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button 
                className="group p-4 rounded-xl bg-card/50 border border-border/40 hover:border-border/60 hover:bg-card/70 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-light text-foreground mb-1">Guided Meditation</p>
                    <p className="text-xs text-muted-foreground font-light">Find calm in a gentle moment</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  setSelectedMood(null);
                  setShowResources(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-light transition-colors"
              >
                Choose a different feeling
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedMood && !showResources) {
    return (
      <Card className="border-none bg-gradient-to-br from-[hsl(40,30%,97%)] via-card to-[hsl(35,25%,97%)] shadow-sm animate-fade-in">
        <CardContent className="py-12 px-8 text-center">
          <p className="text-xl font-playfair font-light text-foreground mb-2 animate-fade-in">
            It's okay to feel {selectedMood.toLowerCase()}.
          </p>
          <p className="text-sm text-muted-foreground font-light animate-fade-in" style={{ animationDelay: '200ms' }}>
            Take your time today.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-gradient-to-br from-[hsl(40,30%,97%)] via-card to-[hsl(35,25%,97%)] shadow-sm">
      <CardContent className="py-10 px-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-2xl font-playfair font-light text-foreground mb-3">
            How are you feeling today?
          </h2>
          <p className="text-sm text-muted-foreground font-light">
            There's no right way to feel. We'll meet you where you are.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2.5">
            {moods.map((mood) => (
              <button
                key={mood.label}
                onClick={() => handleMoodSelect(mood.label)}
                className={`
                  group relative px-5 py-2.5 rounded-full
                  bg-gradient-to-br ${mood.color}
                  transition-all duration-300
                  hover:scale-105 hover:shadow-md
                  ${selectedMood === mood.label ? 'ring-2 ring-offset-2 ring-[hsl(40,40%,70%)] scale-105' : ''}
                  animate-fade-in
                `}
                style={{ animationDelay: `${moods.indexOf(mood) * 30}ms` }}
              >
                <span className="text-xs font-light text-foreground/80 group-hover:text-foreground transition-colors">
                  {mood.label}
                </span>
                {selectedMood === mood.label && (
                  <div className="absolute inset-0 rounded-full bg-[hsl(40,40%,90%)]/20 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
