import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month_year: string;
  created_at: string;
}

export interface CreateBudgetInput {
  category: string;
  limit_amount: number;
  month_year: string;
}

function getCurrentMonthYear() {
  const now = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function useBudgets(monthYear?: string) {
  const { user } = useAuth();
  const currentMonthYear = monthYear || getCurrentMonthYear();

  return useQuery({
    queryKey: ["budgets", user?.id, currentMonthYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("month_year", currentMonthYear);

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateBudgetInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useBudgetWithSpending(monthYear?: string) {
  const { user } = useAuth();
  const currentMonthYear = monthYear || getCurrentMonthYear();

  return useQuery({
    queryKey: ["budgets", "spending", user?.id, currentMonthYear],
    queryFn: async () => {
      const { data: budgets, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("month_year", currentMonthYear);

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { data: expenses } = await supabase
        .from("expenses")
        .select("category, amount")
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      const spendingByCategory: { [key: string]: number } = {};
      (expenses || []).forEach((e) => {
        spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + Number(e.amount);
      });

      return (budgets || []).map((budget) => ({
        ...budget,
        spent: spendingByCategory[budget.category] || 0,
      }));
    },
    enabled: !!user,
  });
}

export function useTotalBudget(monthYear?: string) {
  const { user } = useAuth();
  const currentMonthYear = monthYear || getCurrentMonthYear();

  return useQuery({
    queryKey: ["budgets", "total", user?.id, currentMonthYear],
    queryFn: async () => {
      const { data: budgets } = await supabase
        .from("budgets")
        .select("limit_amount")
        .eq("month_year", currentMonthYear);

      return (budgets || []).reduce((sum, b) => sum + Number(b.limit_amount), 0);
    },
    enabled: !!user,
  });
}
