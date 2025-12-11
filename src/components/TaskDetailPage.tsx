import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Upload, Heart, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { navigateToCaseByLovedOne } from '@/lib/case-utils';

interface Task {
  id: string;
  title: string;
  status: string;
  category: string | null;
  assigned_to_user_id: string | null;
  due_date: string | null;
  description: string | null;
  loved_one_id: string;
}

interface SupportMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [assignee, setAssignee] = useState('');
  const [supportMembers, setSupportMembers] = useState<SupportMember[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'support_member' | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (taskId && user) {
      fetchTask();
      fetchSupportMembers();
    }
  }, [taskId, user]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data: taskData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      
      setTask(taskData);
      setStatus((taskData.status as 'pending' | 'in_progress' | 'completed') || 'pending');
      setNotes(taskData.description || '');
      setAssignee(taskData.assigned_to_user_id || user?.id || '');
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportMembers = async () => {
    try {
      if (!user) return;
      
      // Get the loved one for this task
      const { data: taskData } = await supabase
        .from('tasks')
        .select('loved_one_id')
        .eq('id', taskId)
        .single();

      if (!taskData) return;

      console.log('TaskDetailPage - Fetching support members for loved_one_id:', taskData.loved_one_id);

      // Get current user profile
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      // Create default members array with current user
      const members: SupportMember[] = [{
        id: user.id,
        user_id: user.id,
        first_name: currentUserProfile?.first_name || 'Me',
        last_name: currentUserProfile?.last_name || '',
        role: 'admin'
      }];

      // Check both loved_one_access and accepted support_team_invitations
      const { data: supportData, error: supportError } = await supabase
        .from('loved_one_access')
        .select(`
          user_id,
          role
        `)
        .eq('loved_one_id', taskData.loved_one_id)
        .neq('user_id', user.id); // Exclude current user

      console.log('TaskDetailPage - loved_one_access query result:', supportData, supportError);

      // Also check accepted invitations that might not be in loved_one_access yet
      const { data: acceptedInvitations, error: invitationsError } = await supabase
        .from('support_team_invitations')
        .select(`
          accepted_by_user_id,
          role,
          invited_first_name,
          invited_last_name
        `)
        .eq('loved_one_id', taskData.loved_one_id)
        .eq('status', 'accepted')
        .not('accepted_by_user_id', 'is', null)
        .neq('accepted_by_user_id', user.id);

      console.log('TaskDetailPage - accepted invitations query result:', acceptedInvitations, invitationsError);

      // Process loved_one_access members
      if (supportData?.length) {
        const userIds = supportData.map(member => member.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);

        console.log('TaskDetailPage - profiles for loved_one_access members:', profilesData);

        supportData.forEach(member => {
          const profile = profilesData?.find(p => p.user_id === member.user_id);
          if (profile && profile.first_name && profile.last_name) {
            members.push({
              id: member.user_id,
              user_id: member.user_id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              role: member.role
            });
          }
        });
      }

      // Process accepted invitations (in case they haven't been moved to loved_one_access yet)
      if (acceptedInvitations?.length) {
        acceptedInvitations.forEach(invitation => {
          if (invitation.accepted_by_user_id && 
              invitation.invited_first_name && 
              invitation.invited_last_name &&
              !members.find(m => m.user_id === invitation.accepted_by_user_id)) {
            members.push({
              id: invitation.accepted_by_user_id,
              user_id: invitation.accepted_by_user_id,
              first_name: invitation.invited_first_name,
              last_name: invitation.invited_last_name,
              role: invitation.role
            });
          }
        });
      }

      console.log('TaskDetailPage - Final members list:', members);
      setSupportMembers(members);

      // Determine user role and edit permissions
      const { data: lovedOneData } = await supabase
        .from('loved_ones')
        .select('admin_user_id')
        .eq('id', taskData.loved_one_id)
        .single();

      const isAdmin = lovedOneData?.admin_user_id === user.id;
      const currentUserRole = isAdmin ? 'admin' : 'support_member';
      setUserRole(currentUserRole);

      // For support members, they can only edit tasks assigned to them
      // For admins, they can edit any task
      if (isAdmin) {
        setCanEdit(true);
      } else {
        // Support member can only edit if task is assigned to them
        const currentTask = await supabase
          .from('tasks')
          .select('assigned_to_user_id')
          .eq('id', taskId)
          .single();
        
        setCanEdit(currentTask?.data?.assigned_to_user_id === user.id);
      }
    } catch (error) {
      console.error('Error fetching support members:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!task) return;

    console.log('TaskDetailPage - Saving changes:', {
      taskId: task.id,
      status,
      assignee,
      notes
    });

    try {
      const updateData = {
        status,
        description: notes,
        assigned_to_user_id: assignee || null,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      console.log('TaskDetailPage - Update data being sent:', updateData);

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .select();

      console.log('TaskDetailPage - Update result:', { data, error });

      if (error) throw error;

      // Refresh the task data to reflect changes
      await fetchTask();

      toast({
        title: "Task updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Loading task...</h2>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">Task not found</h2>
          <Button 
            onClick={async () => {
              if (task?.loved_one_id && user) {
                await navigateToCaseByLovedOne(task.loved_one_id, user.id, navigate, '?tab=tasks');
              } else {
                navigate('/dashboard');
              }
            }} 
            className="mt-4"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complete';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  };

  const getTaskContent = (taskId: string) => {
    const taskContentMap: Record<string, any> = {
      'cancel-credit-cards': {
        overview: "Cancelling credit cards is an important step to prevent unauthorized use and protect your loved one's financial accounts. We'll guide you through this process with care and attention to detail.",
        whatYouNeed: [
          "List of all credit cards and account numbers",
          "Death certificate (certified copy)",
          "Documentation of your authority (executor papers, next of kin forms)",
          "Account login information if available"
        ],
        steps: [
          {
            title: "Gather Required Documents",
            description: "Collect death certificate, executor documentation, and any account information you have access to."
          },
          {
            title: "Contact Each Credit Card Company",
            description: "Call the customer service number on each card. Most companies have dedicated departments for deceased account holders."
          },
          {
            title: "Submit Required Documentation",
            description: "Send or fax the required documents. Keep copies of everything you submit."
          },
          {
            title: "Request Account Closure Confirmation",
            description: "Ask for written confirmation that the account has been closed and any final balance information."
          }
        ]
      },
      'notify-social-security': {
        overview: "Reporting a death to Social Security is typically handled by the funeral home, but it's important to confirm and understand the next steps for benefits and records.",
        whatYouNeed: [
          "Social Security number of the deceased",
          "Death certificate",
          "Your identification and relationship documentation",
          "Information about any benefits being received"
        ],
        steps: [
          {
            title: "Confirm Death Was Reported",
            description: "Contact Social Security at 1-800-772-1213 to confirm the death was reported by the funeral home."
          },
          {
            title: "Stop Automatic Payments",
            description: "Ensure any monthly benefits are stopped to avoid overpayments that would need to be returned."
          },
          {
            title: "Apply for Survivor Benefits",
            description: "If applicable, apply for any survivor benefits you or family members may be entitled to receive."
          }
        ]
      }
    };

    return taskContentMap[taskId] || {
      overview: "This task will help you complete an important step in managing your loved one's affairs. Take your time and reach out for support when needed.",
      whatYouNeed: ["Required documents", "Contact information", "Time and patience"],
      steps: [
        { title: "Review Requirements", description: "Understand what needs to be done for this task." },
        { title: "Gather Information", description: "Collect all necessary documents and information." },
        { title: "Take Action", description: "Complete the required steps for this task." },
        { title: "Follow Up", description: "Ensure the task is fully completed and documented." }
      ]
    };
  };

  const taskContent = getTaskContent(task.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={async () => {
                if (task?.loved_one_id && user) {
                  await navigateToCaseByLovedOne(task.loved_one_id, user.id, navigate, '?tab=tasks');
                } else {
                  navigate('/dashboard');
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="outline" className={getStatusColor(status)}>
              {getStatusText(status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Task Header */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{task.category || 'Other'}</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground leading-tight">{task.title}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            {task.description || "This task will help you complete an important step in managing your loved one's affairs. Take your time and reach out for support when needed."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What You'll Need */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>What You'll Need</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Required documents and information</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Contact information for relevant parties</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">Time and patience for the process</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Step-by-Step Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Step-by-Step Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">Review Requirements</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">Understand what needs to be done for this task and gather necessary information.</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">Take Action</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">Complete the required steps for this task at your own pace.</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-foreground">Follow Up</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">Ensure the task is fully completed and documented as needed.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Drop files here or <Button variant="link" className="p-0 h-auto">browse</Button>
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {canEdit ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <Select value={status} onValueChange={(value) => setStatus(value as 'pending' | 'in_progress' | 'completed')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {userRole === 'admin' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Assigned to</label>
                        <Select value={assignee} onValueChange={setAssignee}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {supportMembers.map((member) => (
                              <SelectItem key={member.id} value={member.user_id}>
                                {member.first_name === 'Me' ? 'Me' : `${member.first_name} ${member.last_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Button className="w-full" onClick={handleSaveChanges}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <div className="p-3 bg-muted rounded-md">
                        <span className="text-sm text-muted-foreground">{getStatusText(status)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Assigned to</label>
                      <div className="p-3 bg-muted rounded-md">
                        <span className="text-sm text-muted-foreground">
                          {(() => {
                            const assignedMember = supportMembers.find(m => m.user_id === assignee);
                            return assignedMember 
                              ? (assignedMember.first_name === 'Me' ? 'Me' : `${assignedMember.first_name} ${assignedMember.last_name}`)
                              : 'Unassigned';
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        {userRole === 'support_member' 
                          ? 'You can only edit tasks assigned to you.'
                          : 'You do not have permission to edit this task.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {canEdit ? (
                  <Textarea
                    placeholder="Add any notes, reminders, or important details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                ) : (
                  <div className="min-h-[120px] p-3 bg-muted rounded-md border">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {notes || 'No notes available.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Need support?</p>
                    <p className="text-xs text-muted-foreground">
                      Remember, you don't have to do this alone. Reach out to your family & friends team or our resources.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}