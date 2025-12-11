import { supabase } from "@/integrations/supabase/client";

export type GeneratedTask = {
  title: string;
  category: string | null;
  description?: string | null;
};

const CATS = {
  urgent: 'Urgent Needs (First 48 Hours)',
  memorial: 'Memorial Planning (only if holding a service)',
  legal: 'Legal & Financial',
  home: 'Home, Property & Accounts',
  other: 'Other',
} as const;

function add(tasks: GeneratedTask[], title: string, category: string, description?: string) {
  tasks.push({ title, category, description: description ?? null });
}

function buildTasksFromAnswers(answers: Record<string, any>): GeneratedTask[] {
  const a = answers || {};
  const tasks: GeneratedTask[] = [];
  
  // Detect if this is planning ahead vs recent loss
  const isPlanningAhead = a["planning_reason"] || a["healthcare_directive"] || a["will_status"];
  
  if (isPlanningAhead) {
    // Planning Ahead Tasks - forward-looking
    add(tasks, "Review and update your will or estate plan", CATS.legal, "Ensure your wishes are documented and legally binding");
    
    if (a["will_status"] === "No") {
      add(tasks, "Consult an estate planning attorney", CATS.legal, "Get professional guidance on creating your will");
    }
    
    if (a["healthcare_directive"] === "No" || a["healthcare_directive"] === "Not sure what that is") {
      add(tasks, "Create an advance healthcare directive", CATS.legal, "Document your medical care preferences");
    }
    
    add(tasks, "Designate power of attorney", CATS.legal, "Choose someone to make decisions on your behalf if needed");
    add(tasks, "Document account passwords and access", CATS.home, "Create a secure list of important accounts and credentials");
    add(tasks, "Review beneficiaries on all accounts", CATS.legal, "Update life insurance, retirement accounts, and bank accounts");
    add(tasks, "Organize important documents", CATS.legal, "Gather deeds, titles, insurance policies, and financial records");
    add(tasks, "Consider funeral and burial preferences", CATS.other, "Document your wishes for end-of-life arrangements");
    add(tasks, "Create a list of assets and debts", CATS.legal, "Inventory what you own and owe for your executor");
    add(tasks, "Discuss your plans with family", CATS.other, "Share your wishes and document locations with loved ones");
    
    if (a["planning_reason"] === "Health concerns") {
      add(tasks, "Set up healthcare proxy", CATS.legal, "Ensure someone can make medical decisions if you're unable");
    }
    
  } else {
    // Recent Loss Tasks - immediate needs
    add(tasks, "Order certified copies of the death certificate", CATS.legal);

    // Provider / disposition
    if (a["funeral_home_chosen"] !== "Yes") {
      add(tasks, "Choose and contact a funeral home or crematory", CATS.memorial);
    }
    if (a["disposition"] === "Burial") {
      add(tasks, "Arrange burial or interment (select cemetery and plot)", CATS.memorial);
    } else if (a["disposition"] === "Cremation") {
      add(tasks, "Authorize cremation and select urn or scattering plan", CATS.memorial);
    } else if (a["disposition"] === "Organ/tissue donation") {
      add(tasks, "Coordinate with organ and tissue donation organization", CATS.memorial);
    }

    // Service planning
    const plansService = ["Yes", "Not sure"].includes(a["service"]);
    if (plansService) {
      add(tasks, "Plan service details (venue, speakers, music)", CATS.memorial);
      if (a["printed_programs"] === "Yes") add(tasks, "Design and print service programs", CATS.memorial);
      if (a["livestream"] === "Yes") add(tasks, "Arrange livestream/recording for remote guests", CATS.memorial);
      if (a["flowers"] === "Yes") add(tasks, "Order flowers or décor", CATS.memorial);
      if (a["food"] === "Yes") add(tasks, "Plan reception with food and beverages", CATS.memorial);
    }

    // Dependents
    if (a["dependents"] && a["dependents"] !== "None") {
      add(tasks, "Arrange immediate care for pets and/or dependents", CATS.urgent);
    }

    // Employer / school
    if (a["employer"] === "Yes") {
      add(tasks, "Notify employer or school and request required paperwork", CATS.urgent);
    }

    // Assets / property
    if (a["assets"] === "Yes") {
      add(tasks, "Secure home and property; collect keys and important documents", CATS.urgent);
      add(tasks, "Inventory vehicles, real estate, and major property", CATS.legal);
    }

    // Financial accounts
    const fin = a["financial_accounts"] as string[] | undefined;
    if (Array.isArray(fin)) {
      if (fin.includes("Bank accounts")) add(tasks, "Notify banks and freeze or retitle accounts", CATS.legal);
      if (fin.includes("Credit cards")) add(tasks, "Cancel credit cards and stop automatic payments", CATS.legal);
      if (fin.includes("Investments/retirement")) add(tasks, "Contact investment or retirement account providers", CATS.legal);
    }

    // Debts
    const debts = a["debts"] as string[] | undefined;
    if (Array.isArray(debts)) {
      if (debts.includes("Mortgage/landlord")) add(tasks, "Notify mortgage servicer or landlord", CATS.legal);
      if (debts.includes("Car loan")) add(tasks, "Notify auto lender and secure vehicle", CATS.legal);
      if (debts.includes("Personal/other loan")) add(tasks, "Notify personal or other lenders", CATS.legal);
    }

    // Probate
    if (["Yes", "Not sure"].includes(a["probate"])) {
      add(tasks, "Consult a probate attorney and understand your responsibilities", CATS.legal);
    }

    // Benefits
    const benefits = a["benefits"] as string[] | undefined;
    if (Array.isArray(benefits)) {
      if (benefits.includes("Life insurance")) add(tasks, "File life insurance claim(s)", CATS.legal);
      if (benefits.includes("Retirement benefits")) add(tasks, "Claim retirement or pension benefits", CATS.legal);
      if (benefits.includes("Veterans' benefits")) add(tasks, "Apply for veterans' benefits if eligible", CATS.legal);
    }

    // Utilities
    const util = a["utilities"] as string[] | undefined;
    if (Array.isArray(util)) {
      if (util.includes("Electric/gas/water")) add(tasks, "Update or cancel utilities (electric, gas, water)", CATS.home);
      if (util.includes("Cell phone")) add(tasks, "Transfer or cancel cell phone plan", CATS.home);
      if (util.includes("Cable/internet")) add(tasks, "Transfer or cancel cable/internet service", CATS.home);
    }

    // Online accounts
    const online = a["online_accounts"] as string[] | undefined;
    if (Array.isArray(online)) {
      if (online.includes("Email/cloud (Google/Apple/Microsoft)")) add(tasks, "Secure email/cloud accounts and back up important data", CATS.home);
      if (online.includes("Social media")) add(tasks, "Memorialize or close social media accounts", CATS.home);
      if (online.includes("Streaming/news subscriptions")) add(tasks, "Cancel or transfer online subscriptions", CATS.home);
      if (online.includes("Password manager/crypto")) add(tasks, "Locate password manager or crypto keys and secure access", CATS.home);
    }

    // Veteran
    if (a["veteran"] === "Yes") {
      add(tasks, "Request military funeral honors (if desired)", CATS.legal);
      add(tasks, "Apply for VA burial benefits", CATS.legal);
    }

    // Jurisdiction guidance
    const state = a?.jurisdiction?.state || a?.jurisdiction?.state_code;
    const county = a?.jurisdiction?.county;
    if (state && county && county !== "unknown") {
      add(tasks, `Locate ${county} County vital records office in ${state}`, CATS.legal);
    }

    // Role-based
    if (a["role"] === "Executor") {
      add(tasks, "Collect will and letters testamentary once issued", CATS.legal);
    }
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return tasks.filter(t => {
    if (seen.has(t.title)) return false;
    seen.add(t.title);
    return true;
  });
}

export async function generatePersonalizedTasks(
  answers: Record<string, any>,
  lovedOneId: string,
  userId?: string | null
) {
  try {
    const tasks = buildTasksFromAnswers(answers);

    // Remove previous personalized tasks for this loved one to avoid duplicates
    await supabase
      .from("tasks")
      .delete()
      .eq("loved_one_id", lovedOneId)
      .eq("is_personalized", true);

    if (tasks.length === 0) return;

    const payload = tasks.map(t => ({
      loved_one_id: lovedOneId,
      title: t.title,
      category: t.category,
      description: t.description ?? null,
      status: "pending",
      is_custom: false,
      is_personalized: true,
      created_by_user_id: userId ?? null,
    }));

    const { error } = await supabase.from("tasks").insert(payload);
    if (error) throw error;
  } catch (e) {
    console.error("Failed to generate personalized tasks", e);
    // swallow errors to not block UX
  }
}
