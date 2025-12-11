import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { taskCategories } from '@/data/mockTasks';
import { CheckCircle2, Clock, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import InlineCustomTaskForm from '@/components/InlineCustomTaskForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { flags } from '@/lib/flags';
import { useNavigate } from 'react-router-dom';
import { generatePersonalizedTasks } from '@/lib/onboarding/plan';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  status: string;
  category: string | null;
  assigned_to_user_id: string | null;
  due_date: string | null;
  description: string | null;
  loved_one_id: string;
  is_custom?: boolean | null;
  created_by_user_id?: string | null;
  assignee_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface TaskDashboardProps {
  lovedOneId: string;
  userRole?: 'admin' | 'support_member' | null;
}

export function TaskDashboard({ lovedOneId, userRole }: TaskDashboardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportMembers, setSupportMembers] = useState<{ [key: string]: { name: string; avatar?: string } }>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [completionPct, setCompletionPct] = useState<number>(0);
  const autoSeededRef = useRef(false);

  const fetchOnboardingStatus = async () => {
    const { data } = await (supabase as any)
      .from('onboarding_answers')
      .select('completion_pct')
      .eq('loved_one_id', lovedOneId)
      .maybeSingle();
    setCompletionPct(data?.completion_pct || 0);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          status,
          category,
          assigned_to_user_id,
          due_date,
          description,
          loved_one_id,
          is_custom,
          created_by_user_id,
          assignee_profile:profiles!tasks_assigned_to_user_id_fkey(user_id, first_name, last_name, avatar_url)
        `)
        .eq('loved_one_id', lovedOneId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assignedUserIds = [...new Set(tasksData?.map(task => task.assigned_to_user_id).filter(Boolean))];
      let membersMap: { [key: string]: { name: string; avatar?: string } } = {};
      if (assignedUserIds.length > 0) {
        const { data: profilesData } = await supabase.rpc('get_profiles_for_users', {
          user_ids: assignedUserIds,
          loved_one_id: lovedOneId,
        });
        profilesData?.forEach((profile: any) => {
          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
          membersMap[profile.user_id] = { name: fullName || 'Assigned', avatar: profile.avatar_url || undefined };
        });
      }
      if (user) {
        membersMap[user.id] = { name: 'Me', avatar: user.user_metadata?.avatar_url };
      }

      setSupportMembers(membersMap);
      setTasks((tasksData || []) as unknown as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && lovedOneId) {
      fetchTasks();
      fetchOnboardingStatus();
    }
  }, [user, lovedOneId]);

  // If onboarding is complete and no tasks are present, seed personalized tasks
  useEffect(() => {
    if (!user || !lovedOneId) return;
    if (autoSeededRef.current) return;
    if (loading) return;
    if (completionPct < 100) return;
    if (tasks.length > 0) return;
    autoSeededRef.current = true;
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from('onboarding_answers')
          .select('answers_json')
          .eq('loved_one_id', lovedOneId)
          .maybeSingle();
        await generatePersonalizedTasks(data?.answers_json || {}, lovedOneId, user.id);
        await fetchTasks();
      } catch (e) {
        console.error('Auto-seed personalized tasks failed', e);
      }
    })();
  }, [user, lovedOneId, completionPct, loading, tasks.length]);

  const handleCreated = (inserted: any) => {
    try {
      setTasks((prev) => [inserted as Task, ...prev]);
    } catch (e) {
      console.error('Failed to append created task, refetching', e);
    } finally {
      setOpenCategory(null);
      fetchTasks();
    }
  };

  const getTasksByCategory = (category: string) => tasks.filter(task => task.category === category && task.status !== 'hidden');

  const getStatusStats = () => {
    const visible = tasks.filter(t => t.status !== 'hidden');
    const total = visible.length;
    const completed = visible.filter(task => task.status === 'completed').length;
    const inProgress = visible.filter(task => task.status === 'in_progress').length;
    const notStarted = visible.filter(task => task.status === 'pending').length;
    return { total, completed, inProgress, notStarted };
  };

  const stats = getStatusStats();

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Personalization Banner */}
        {flags.onboarding_v1_personalized && completionPct < 100 && (
          <Card className="border-dashed">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md"><Sparkles className="h-4 w-4 text-primary" /></div>
                <div>
                  <div className="font-medium">We can personalize this for you.</div>
                  <div className="text-sm text-muted-foreground">Answer a few quick questions whenever you’re ready.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">{completionPct}% complete</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-semibold text-emerald-600">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                  <p className="text-2xl font-semibold text-slate-600">{stats.notStarted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Categories */}
        <div className="space-y-8">
          {taskCategories.map((category) => {
            const categoryTasks = getTasksByCategory(category);

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">{category}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {categoryTasks.length} task{categoryTasks.length !== 1 ? 's' : ''}
                    </Badge>
                    {userRole !== 'support_member' && (
                      <Button size="sm" onClick={() => setOpenCategory(openCategory === category ? null : category)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Custom Task
                      </Button>
                    )}
                  </div>
                </div>
                {openCategory === category && (
                  <InlineCustomTaskForm
                    lovedOneId={lovedOneId}
                    defaultCategory={category}
                    categories={taskCategories}
                    supportMembers={supportMembers}
                    onCancel={() => setOpenCategory(null)}
                    onCreated={handleCreated}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={{
                        id: task.id,
                        title: task.title,
                        status: task.status === 'pending' ? 'not-started' : 
                               task.status === 'in_progress' ? 'in-progress' : 
                               task.status === 'completed' ? 'complete' : 'not-started',
                        category: task.category || 'Other',
                        assignee: { 
                          name: (() => {
                            if (!task.assigned_to_user_id) return 'Unassigned';
                            const prof = task.assignee_profile;
                            if (prof) {
                              const fullName = [prof.first_name, prof.last_name].filter(Boolean).join(' ').trim();
                              if (fullName) return fullName;
                            }
                            const member = supportMembers[task.assigned_to_user_id!];
                            return member?.name || 'Assigned';
                          })(),
                          avatar: (() => {
                            if (!task.assigned_to_user_id) return undefined;
                            return task.assignee_profile?.avatar_url || supportMembers[task.assigned_to_user_id!]?.avatar;
                          })()
                        },
                        dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : undefined,
                        description: task.description || undefined,
                        isCustom: Boolean(task.is_custom),
                      }} 
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
}
