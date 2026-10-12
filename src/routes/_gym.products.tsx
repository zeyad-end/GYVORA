import { createFileRoute } from "@tanstack/react-router";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, PageHeader, Panel, StatusPill, td } from "@/components/kit";
import { egp, products } from "@/lib/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/products")({
  head: () => seo("Products & inventory", "Track product stock, prices, sales and low-stock alerts."),
  component: () => {
    const low = products.filter((p) => p.qty < p.min);
    return (
      <>
        <PageHeader title="Products & inventory" actions={<Button><Plus className="h-4 w-4" />Add product</Button>} />
        {low.length > 0 && (
          <div className="panel mb-6 flex items-center gap-3 border-warning/40 p-4 text-sm"><AlertTriangle className="h-4 w-4 text-warning" />{low.length} products below minimum stock: {low.map((p) => p.name).join(", ")}</div>
        )}
        <Panel>
          <DataTable head={["Product", "Quantity", "Price", "Sales", "Stock"]}>
            {products.map((p) => (
              <tr key={p.name}><td className={`${td} font-medium`}>{p.name}</td><td className={td}>{p.qty}</td><td className={td}>{egp(p.price)}</td><td className={`${td} text-muted-foreground`}>{p.sales} sold</td><td className={td}><StatusPill status={p.qty < p.min ? "Low stock" : "In stock"} /></td></tr>
            ))}
          </DataTable>
        </Panel>
      </>
    );
  },
});
