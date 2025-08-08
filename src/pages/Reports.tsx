import AppLayout from "@/components/layout/AppLayout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCY_SYMBOL, DEFAULT_DATE_FORMAT } from "@/config/constants";
import { fetchEntries } from "@/services/finance";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Reports() {
  const [range, setRange] = useState({ from: format(new Date(Date.now() - 6*86400000), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });
  const [income, setIncome] = useState<any[]>([]);
  const [expense, setExpense] = useState<any[]>([]);

  async function load() {
    const [inc, exp] = await Promise.all([
      fetchEntries('income', range.from, range.to),
      fetchEntries('expense', range.from, range.to),
    ]);
    setIncome(inc); setExpense(exp);
  }

  const daily = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    const from = new Date(range.from); const to = new Date(range.to);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      map.set(format(d, 'yyyy-MM-dd'), { income: 0, expense: 0 });
    }
    income.forEach(i => { const key = i.date.slice(0,10); const v = map.get(key); if (v) v.income += i.amount; });
    expense.forEach(e => { const key = e.date.slice(0,10); const v = map.get(key); if (v) v.expense += e.amount; });
    return Array.from(map.entries()).map(([d,v]) => ({ date: format(new Date(d), DEFAULT_DATE_FORMAT), ...v }));
  }, [income, expense, range]);

  const expenseByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    expense.forEach(e => totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount));
    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
  }, [expense]);

  function exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Date", "Income (₹)", "Expense (₹)"]],
      body: daily.map(d => [d.date, d.income.toFixed(2), d.expense.toFixed(2)])
    });
    doc.save("report.pdf");
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(daily);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "report.xlsx");
  }

  const COLORS = ["hsl(var(--destructive))", "hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--ring))", "hsl(var(--foreground))"];

  return (
    <AppLayout>
      <Seo title="Reports – Smart Market Ledger" />
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div>
          <Label>From</Label>
          <Input type="date" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} />
        </div>
        <div className="flex items-end">
          <Button onClick={load} variant="hero">Load</Button>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={exportPDF} variant="subtle">Export PDF</Button>
          <Button onClick={exportExcel} variant="outline">Export Excel</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-3 bg-card">
          <h2 className="font-semibold mb-2">Daily Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily}>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--accent))" name={`Income (${CURRENCY_SYMBOL})`} />
              <Bar dataKey="expense" fill="hsl(var(--destructive))" name={`Expense (${CURRENCY_SYMBOL})`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg border p-3 bg-card">
          <h2 className="font-semibold mb-2">Expense by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseByCategory} dataKey="value" nameKey="name" outerRadius={110}>
                {expenseByCategory.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
}
