import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Mail, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

interface RoadmapItem {
  id: string;
  task: string;
  completed: boolean;
  category: string;
}

interface RoadmapGeneratorProps {
  answers: Record<number, string>;
  onStartOver: () => void;
  onEditAnswers: () => void;
}

export const RoadmapGenerator = ({ answers, onStartOver, onEditAnswers }: RoadmapGeneratorProps) => {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(generateRoadmap(answers));

  // Track roadmap generation
  useState(() => {
    analytics.trackRoadmapGenerated(Object.keys(answers).length);
  });

  const toggleItem = (id: string) => {
    setRoadmap(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleStartOver = () => {
    analytics.trackButtonClick('start_over', 'roadmap_page');
    onStartOver();
  };

  const handleEditAnswers = () => {
    analytics.trackButtonClick('edit_answers', 'roadmap_page');
    onEditAnswers();
  };

  const categories = Array.from(new Set(roadmap.map(item => item.category)));
  const completedCount = roadmap.filter(item => item.completed).length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
            <Check className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Your Personal Roadmap</h1>
          <p className="text-muted-foreground mb-4">
            I've created a personalized roadmap based on your situation. Take your time with each step.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{completedCount} of {roadmap.length} completed</span>
            <div className="w-32 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / roadmap.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 mb-8">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="w-4 h-4" />
            Email to me
          </Button>
          <Button variant="outline" size="sm" onClick={handleEditAnswers}>
            Edit answers
          </Button>
          <Button variant="ghost" size="sm" onClick={handleStartOver}>
            Start over
          </Button>
        </div>

        {/* Roadmap by Categories */}
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = roadmap.filter(item => item.category === category);
            const categoryCompleted = categoryItems.filter(item => item.completed).length;
            
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {category}
                    <span className="text-sm font-normal text-muted-foreground">
                      {categoryCompleted}/{categoryItems.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryItems.map(item => (
                    <div key={item.id} className="flex items-start gap-3 group">
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <label 
                        htmlFor={item.id}
                        className={cn(
                          "text-sm leading-relaxed cursor-pointer transition-colors",
                          item.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}
                      >
                        {item.task}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function generateRoadmap(answers: Record<number, string>): RoadmapItem[] {
  const roadmap: RoadmapItem[] = [];
  let id = 1;

  // Immediate Tasks
  roadmap.push({
    id: (id++).toString(),
    task: "Contact close family and friends to inform them of the passing",
    completed: false,
    category: "Immediate Tasks"
  });

  if (answers[4] !== "Yes") {
    roadmap.push({
      id: (id++).toString(),
      task: "Secure the home - lock doors, windows, and valuables",
      completed: false,
      category: "Immediate Tasks"
    });
  }

  if (answers[10] === "Yes") {
    roadmap.push({
      id: (id++).toString(),
      task: "Arrange care for pets, plants, or property that need immediate attention",
      completed: false,
      category: "Immediate Tasks"
    });
  }

  // Funeral & Memorial
  if (answers[3] !== "No") {
    roadmap.push({
      id: (id++).toString(),
      task: "Contact funeral home or crematory",
      completed: false,
      category: "Funeral & Memorial"
    });

    if (answers[6] === "No" || answers[6] === "Not sure") {
      roadmap.push({
        id: (id++).toString(),
        task: "Make funeral or memorial service arrangements",
        completed: false,
        category: "Funeral & Memorial"
      });
    }
  }

  if (answers[18] === "Yes") {
    roadmap.push({
      id: (id++).toString(),
      task: "Write and publish obituary",
      completed: false,
      category: "Funeral & Memorial"
    });
  }

  // Legal & Financial
  if (answers[11] === "Yes" || answers[11] === "Not sure") {
    roadmap.push({
      id: (id++).toString(),
      task: "Locate will and legal documents",
      completed: false,
      category: "Legal & Financial"
    });
  }

  if (answers[12] === "I am the executor") {
    roadmap.push({
      id: (id++).toString(),
      task: "Contact probate attorney if needed",
      completed: false,
      category: "Legal & Financial"
    });
  }

  roadmap.push({
    id: (id++).toString(),
    task: "Obtain certified copies of death certificate (you'll need multiple)",
    completed: false,
    category: "Legal & Financial"
  });

  if (answers[14] === "Yes" || answers[14] === "Not sure") {
    roadmap.push({
      id: (id++).toString(),
      task: "Contact banks and financial institutions",
      completed: false,
      category: "Legal & Financial"
    });
    roadmap.push({
      id: (id++).toString(),
      task: "Contact insurance companies (life, health, auto, home)",
      completed: false,
      category: "Legal & Financial"
    });
  }

  if (answers[15] === "Yes") {
    roadmap.push({
      id: (id++).toString(),
      task: "Contact Social Security Administration",
      completed: false,
      category: "Government & Benefits"
    });
    roadmap.push({
      id: (id++).toString(),
      task: "Contact Veterans Affairs if applicable",
      completed: false,
      category: "Government & Benefits"
    });
  }

  // Digital & Accounts
  if (answers[17] === "Yes") {
    roadmap.push({
      id: (id++).toString(),
      task: "Secure or memorialize social media accounts",
      completed: false,
      category: "Digital & Accounts"
    });
    roadmap.push({
      id: (id++).toString(),
      task: "Cancel or transfer digital subscriptions and services",
      completed: false,
      category: "Digital & Accounts"
    });
  }

  roadmap.push({
    id: (id++).toString(),
    task: "Cancel credit cards and recurring payments",
    completed: false,
    category: "Digital & Accounts"
  });

  // Support
  if (answers[21] === "Yes please") {
    roadmap.push({
      id: (id++).toString(),
      task: "Connect with grief counselor or support group",
      completed: false,
      category: "Personal Support"
    });
  }

  if (answers[20] === "Yes") {
    roadmap.push({
      id: (id++).toString(),
      task: "Reach out to family and friends for help with tasks",
      completed: false,
      category: "Personal Support"
    });
  }

  return roadmap;
}