import AppLayout from "@/components/layout/AppLayout";
import { Seo } from "@/components/Seo";
import StatCard from "@/components/common/StatCard";
import { useEffect, useMemo, useState } from "react";
import { fetchEntries } from "@/services/finance";
import { CURRENCY_SYMBOL } from "@/config/constants";
import { format } from "date-fns";
import { DEFAULT_DATE_FORMAT } from "@/config/constants";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Point { date: string; income: number; expense: number; }

export default function Dashboard() {
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [series, setSeries] = useState<Point[]>([]);

  useEffect(() => {
    const todayISO = format(new Date(), 'yyyy-MM-dd');
    Promise.all([
      fetchEntries('income', todayISO, todayISO),
      fetchEntries('expense', todayISO, todayISO)
    ]).then(([inc, exp]) => {
      setTodayIncome(inc.reduce((s, i) => s + i.amount, 0));
      setTodayExpense(exp.reduce((s, e) => s + e.amount, 0));
    }).catch(() => {});

    const days = 7;
    const from = format(new Date(Date.now() - (days - 1) * 86400000), 'yyyy-MM-dd');
    Promise.all([
      fetchEntries('income', from),
      fetchEntries('expense', from)
    ]).then(([inc, exp]) => {
      const map = new Map<string, { income: number; expense: number }>();
      for (let i = 0; i < days; i++) {
        const d = format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd');
        map.set(d, { income: 0, expense: 0 });
      }
      inc.forEach(i => {
        const key = i.date.slice(0, 10);
        const v = map.get(key); if (v) v.income += i.amount;
      });
      exp.forEach(e => {
        const key = e.date.slice(0, 10);
        const v = map.get(key); if (v) v.expense += e.amount;
      });
      const arr: Point[] = Array.from(map.entries()).sort().map(([d, v]) => ({
        date: format(new Date(d), DEFAULT_DATE_FORMAT),
        income: v.income,
        expense: v.expense,
      }));
      setSeries(arr);
    }).catch(() => {});
  }, []);

  const profit = todayIncome - todayExpense;
  const profitPct = todayIncome > 0 ? (profit / todayIncome) * 100 : 0;

  return (
    <AppLayout>
      <Seo title="Dashboard – Smart Market Ledger" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Today's Income" value={`${CURRENCY_SYMBOL}${todayIncome.toFixed(2)}`} />
        <StatCard title="Today's Expense" value={`${CURRENCY_SYMBOL}${todayExpense.toFixed(2)}`} />
        <StatCard title="Today's Profit/Loss" value={`${CURRENCY_SYMBOL}${profit.toFixed(2)}`} tone={profit >= 0 ? 'success' : 'danger'} />
        <StatCard title="Profit %" value={`${profitPct.toFixed(1)}%`} tone={profit >= 0 ? 'success' : 'danger'} />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Last 7 days</h2>
        <div className="mt-3 rounded-lg border p-3 bg-card">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
              <Legend />
              <Area type="monotone" dataKey="income" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#income)" />
              <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#expense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </AppLayout>
  );
}
