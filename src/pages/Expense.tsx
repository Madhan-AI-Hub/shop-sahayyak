import AppLayout from "@/components/layout/AppLayout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, CURRENCY_SYMBOL, DEFAULT_DATE_FORMAT } from "@/config/constants";
import { addEntry } from "@/services/finance";
import { useState } from "react";
import { format } from "date-fns";

export default function Expense() {
  const [form, setForm] = useState<{ amount: string; category: string; date: string; note: string }>({ amount: '', category: EXPENSE_CATEGORIES[0] as string, date: format(new Date(), 'yyyy-MM-dd'), note: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await addEntry({ type: 'expense', amount: parseFloat(form.amount), category: form.category, date: form.date, note: form.note });
      setForm({ amount: '', category: EXPENSE_CATEGORIES[0], date: format(new Date(), 'yyyy-MM-dd'), note: '' });
      alert('Expense saved');
    } catch (e) {
      alert('Error saving expense');
    } finally { setLoading(false); }
  }

  return (
    <AppLayout>
      <Seo title="Add Expense – Smart Market Ledger" />
      <h1 className="text-2xl font-semibold">Add Expense</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 max-w-xl">
        <div>
          <Label>Amount ({CURRENCY_SYMBOL})</Label>
          <Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger> <SelectValue placeholder="Select" /> </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          <p className="text-xs text-muted-foreground mt-1">Format: {DEFAULT_DATE_FORMAT}</p>
        </div>
        <div>
          <Label>Note (optional)</Label>
          <Input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>
        <div>
          <Button type="submit" variant="hero" disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</Button>
        </div>
      </form>
    </AppLayout>
  );
}
