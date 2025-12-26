export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const categories: Category[] = [
  { id: "food", name: "Food & Dining", emoji: "🍔", color: "text-orange-400", bgColor: "bg-orange-400/20" },
  { id: "transport", name: "Transport", emoji: "🚗", color: "text-blue-400", bgColor: "bg-blue-400/20" },
  { id: "shopping", name: "Shopping", emoji: "🛍️", color: "text-pink-400", bgColor: "bg-pink-400/20" },
  { id: "entertainment", name: "Entertainment", emoji: "🎬", color: "text-purple-400", bgColor: "bg-purple-400/20" },
  { id: "bills", name: "Bills & Utilities", emoji: "💡", color: "text-yellow-400", bgColor: "bg-yellow-400/20" },
  { id: "health", name: "Health", emoji: "💊", color: "text-green-400", bgColor: "bg-green-400/20" },
  { id: "travel", name: "Travel", emoji: "✈️", color: "text-cyan-400", bgColor: "bg-cyan-400/20" },
  { id: "groceries", name: "Groceries", emoji: "🛒", color: "text-lime-400", bgColor: "bg-lime-400/20" },
  { id: "subscription", name: "Subscriptions", emoji: "📺", color: "text-indigo-400", bgColor: "bg-indigo-400/20" },
  { id: "education", name: "Education", emoji: "📚", color: "text-teal-400", bgColor: "bg-teal-400/20" },
  { id: "personal", name: "Personal Care", emoji: "💅", color: "text-rose-400", bgColor: "bg-rose-400/20" },
  { id: "other", name: "Other", emoji: "📦", color: "text-slate-400", bgColor: "bg-slate-400/20" },
];

export function getCategoryById(id: string): Category {
  return categories.find(c => c.id === id) || categories[categories.length - 1];
}