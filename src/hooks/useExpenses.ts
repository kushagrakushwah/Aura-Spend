import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  receipt_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  currency?: string;
  category: string;
  date: string;
  receipt_url?: string | null;
  is_verified?: boolean;
}

export function useExpenses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useRecentExpenses(limit: number = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", "recent", user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          ...input,
          user_id: user.id,
          currency: input.currency || "INR",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useExpenseStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", "stats", user?.id],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

      const [currentMonth, lastMonth] = await Promise.all([
        supabase
          .from("expenses")
          .select("amount")
          .gte("date", startOfMonth.split("T")[0])
          .lte("date", endOfMonth.split("T")[0]),
        supabase
          .from("expenses")
          .select("amount")
          .gte("date", startOfLastMonth.split("T")[0])
          .lte("date", endOfLastMonth.split("T")[0]),
      ]);

      const currentTotal = (currentMonth.data || []).reduce((sum, e) => sum + Number(e.amount), 0);
      const lastTotal = (lastMonth.data || []).reduce((sum, e) => sum + Number(e.amount), 0);

      const trend = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

      return {
        currentMonthTotal: currentTotal,
        lastMonthTotal: lastTotal,
        trend: Math.round(trend),
      };
    },
    enabled: !!user,
  });
}

export function useWeeklySpending() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", "weekly", user?.id],
    queryFn: async () => {
      const now = new Date();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const result: { day: string; amount: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const { data } = await supabase
          .from("expenses")
          .select("amount")
          .eq("date", dateStr);

        const total = (data || []).reduce((sum, e) => sum + Number(e.amount), 0);
        result.push({ day: days[date.getDay()], amount: total });
      }

      return result;
    },
    enabled: !!user,
  });
}

export function useCategorySpending() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", "category", user?.id],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const { data } = await supabase
        .from("expenses")
        .select("category, amount")
        .gte("date", startOfMonth);

      const categoryTotals: { [key: string]: number } = {};
      (data || []).forEach((e) => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
      });

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount,
      }));
    },
    enabled: !!user,
  });
}
