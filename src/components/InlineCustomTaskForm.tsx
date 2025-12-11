import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { createTask } from "@/lib/tasks";
import { useAuth } from "@/hooks/useAuth";
import { analytics } from "@/lib/analytics";

export type MemberMap = { [id: string]: { name: string; avatar?: string } };

const FormSchema = z.object({
  title: z.string().min(1, "Title is required").max(80),
  category: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

interface InlineCustomTaskFormProps {
  lovedOneId?: string | null;
  defaultCategory?: string | null;
  categories?: string[];
  supportMembers?: MemberMap;
  onCancel?: () => void;
  onCreated?: (task: any) => void;
}

export default function InlineCustomTaskForm({
  lovedOneId,
  defaultCategory,
  categories = [],
  supportMembers = {},
  onCancel,
  onCreated,
}: InlineCustomTaskFormProps) {
  const { user } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      category: defaultCategory || categories[0] || "Other",
      description: "",
      assignedTo: undefined,
      dueDate: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setSubmitError(null);
    try {
      if (!lovedOneId || !user) throw new Error("Missing context to create task.");

      const inserted = await createTask({
        lovedOneId,
        title: values.title,
        category: values.category,
        description: values.description || null,
        assignedToUserId: values.assignedTo || null,
        dueDate: values.dueDate ? new Date(values.dueDate) : null,
        isCustom: true,
        creatorUserId: user.id,
      });

      analytics.event("task_custom_created", {
        task_id: inserted.id,
        profile_id: lovedOneId,
        creator_id: user.id,
        category: values.category,
        has_description: Boolean(values.description && values.description.length > 0),
        assigned_to: values.assignedTo || null,
        due_date_set: Boolean(values.dueDate),
        created_at: new Date().toISOString(),
      });

      onCreated?.(inserted);
      onCancel?.();
    } catch (e: any) {
      console.error("InlineCustomTaskForm create error", e);
      setSubmitError(e?.message || "Failed to create task. Please try again.");
    }
  };

  return (
    <Card className="mt-3">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {Array.from(new Set([...(categories || []), "Other"]))
                        .filter(Boolean)
                        .map((cat) => (
                          <option key={cat as string} value={cat as string}>
                            {cat}
                          </option>
                        ))}
                    </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                    <select
                      value={(field.value as string) ?? ""}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Unassigned</option>
                      {Object.entries(supportMembers || {}).map(([id, info]) => (
                        <option key={id} value={id}>
                          {info.name}
                        </option>
                      ))}
                    </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Add details (max 500 chars)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" value={(field.value as string) ?? ""} onChange={(e) => field.onChange(e.target.value || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save Task</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
