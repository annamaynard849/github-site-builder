import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TaskData {
  id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'complete';
  category: string;
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  description?: string;
  isCustom?: boolean;
}

interface TaskCardProps {
  task: TaskData;
}

export function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'not-started':
        return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  };

  const handleClick = () => {
    navigate(`/task/${task.id}`);
  };

  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-border group"
      onClick={handleClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            {task.isCustom && (
              <Badge variant="secondary" className="text-xs px-2 py-1">Custom</Badge>
            )}
            <Badge 
              variant="outline" 
              className={`ml-2 text-xs px-2 py-1 ${getStatusColor(task.status)}`}
            >
              {getStatusText(task.status)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback className="text-xs bg-muted">
                {task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">{task.assignee.name}</span>
          </div>

          {task.dueDate && (
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{task.dueDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}