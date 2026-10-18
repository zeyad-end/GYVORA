import { RecurringExpenses } from "@/components/RecurringExpenses";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Wallet, TrendingUp, TrendingDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, PageHeader, Panel, StatCard, td } from "@/components/kit";
import { egp, expenseCategories, recurring, revenueSeries, transactions } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/finance")({
  head: () => seo("Finance", "Transactions, expenses, recurring costs, cash register and reports."),
  component: Finance,
});

const sel = "h-10 w-full rounded-md border bg-surface px-3 text-sm";

function Finance() {
  const [tx, setTx] = useState(transactions);
  const income = tx.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const exp = tx.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0);
  return (
    <>
      <PageHeader title="Finance" subtitle="Every financial movement in one place" />
      <Tabs defaultValue="tx">
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start bg-card">
          <TabsTrigger value="tx">Transactions</TabsTrigger>
          <TabsTrigger value="exp">Expenses</TabsTrigger>
          <TabsTrigger value="rec">Recurring</TabsTrigger>
          <TabsTrigger value="cash">Cash register</TabsTrigger>
          <TabsTrigger value="rep">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tx">
          <Panel>
            <DataTable head={["Date", "Type", "Category", "Method", "Amount"]}>
              {tx.map((t, i) => <tr key={i}><td className={`${td} text-muted-foreground`}>{t.date}</td><td className={td}>{t.type}</td><td className={td}>{t.category}</td><td className={td}>{t.method}</td><td className={`${td} font-medium ${t.amount < 0 ? "text-destructive" : "text-success"}`}>{t.amount < 0 ? "−" : "+"}{egp(t.amount)}</td></tr>)}
            </DataTable>
          </Panel>
        </TabsContent>

        <TabsContent value="exp">
          <Panel title="Add expense" className="max-w-2xl">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const amount = Math.abs(Number(d.get("amount")) || 0);
              setTx([{ date: String(d.get("date")), type: "Expense", category: String(d.get("cat")), amount: -amount, method: "Cash" }, ...tx]);
              toast.success("Expense added and deducted from profit");
              e.currentTarget.reset();
            }}>
              <div className="space-y-2"><Label>Category</Label><select name="cat" className={sel}>{expenseCategories.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="space-y-2"><Label>Amount (EGP)</Label><Input name="amount" type="number" min={1} required className="bg-surface" /></div>
              <div className="space-y-2"><Label>Date</Label><Input name="date" type="date" required defaultValue="2026-10-07" className="bg-surface" /></div>
              <div className="space-y-2"><Label>Invoice</Label><label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed bg-surface px-3 text-sm text-muted-foreground"><Upload className="h-4 w-4" />Upload file<input type="file" className="hidden" /></label></div>
              <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea maxLength={500} className="bg-surface" /></div>
              <Button type="submit" className="sm:col-span-2">Save expense</Button>
            </form>
          </Panel>
        </TabsContent>

        <TabsContent value="rec">
          <RecurringExpenses />
        </TabsContent>

        <TabsContent value="cash">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Current balance" value={egp(286900 + income - exp)} icon={Wallet} />
            <StatCard label="Total income" value={egp(income)} icon={TrendingUp} tone="good" delta="Last 3 days" />
            <StatCard label="Total expenses" value={egp(exp)} icon={TrendingDown} tone="bad" delta="Last 3 days" />
          </div>
        </TabsContent>

        <TabsContent value="rep">
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Daily revenue" value="EGP 18,420" icon={TrendingUp} />
            <StatCard label="Monthly revenue" value="EGP 212,000" icon={TrendingUp} />
            <StatCard label="Yearly revenue" value="EGP 1.73M" icon={TrendingUp} />
            <StatCard label="Net profit (YTD)" value="EGP 812,000" icon={Wallet} tone="good" delta="Expenses deducted" />
          </div>
          <Panel title="Monthly revenue">
            <div className="h-64"><ResponsiveContainer><BarChart data={revenueSeries}><XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10 }} cursor={{ fill: "var(--secondary)" }} /><Bar dataKey="revenue" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /><Bar dataKey="expenses" fill="var(--chart-4)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
