import { supabase } from "@/integrations/supabase/client";

export type CreateTaskWithCaseInput = {
  caseId: string;
  lovedOneId: string;
  title: string;
  category: string | null;
  description?: string | null;
  assignedToUserId?: string | null;
  dueDate?: Date | null;
  isCustom?: boolean;
  creatorUserId?: string;
};

export async function createTaskWithCase(input: CreateTaskWithCaseInput) {
  const { caseId, lovedOneId, title, category, description, assignedToUserId, dueDate, isCustom = false, creatorUserId } = input;

  const insertPayload: any = {
    case_id: caseId,
    loved_one_id: lovedOneId,
    title,
    category,
    description: description ?? null,
    assigned_to_user_id: assignedToUserId ?? null,
    due_date: dueDate ? dueDate.toISOString().slice(0, 10) : null,
    status: 'pending',
    is_custom: isCustom,
    created_by_user_id: creatorUserId ?? null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
