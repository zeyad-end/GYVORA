import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus, AlertTriangle, Package, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DataTable, Field, PageHeader, Panel, StatusPill, td } from "@/components/kit";
import { egp } from "@/lib/mock";
import { readFile, setState, stockStatus, useStore, type Product } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_gym/products")({
  head: () => seo("Products & inventory", "Track product stock, prices, sales and low-stock alerts."),
  component: Products,
});

function Thumb({ p, cls = "h-10 w-10" }: { p: Product; cls?: string }) {
  return p.image ? <img src={p.image} alt={p.name} className={`${cls} shrink-0 rounded-lg object-cover`} /> : <span className={`grid ${cls} shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground`}><Package className="h-4 w-4" /></span>;
}

function Products() {
  const products = useStore((s) => s.products);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [img, setImg] = useState("");
  const [viewName, setViewName] = useState<string | null>(null);
  const viewing = products.find((p) => p.name === viewName) ?? null;
  const alerts = products.filter((p) => stockStatus(p.qty) !== "In stock");

  const changeQty = (p: Product, d: number) => setState((s) => ({ products: s.products.map((x) => x.name === p.name ? { ...x, qty: Math.max(0, x.qty + d) } : x) }));
  const openForm = (p: Product | null) => { setEditing(p); setImg(p?.image ?? ""); setFormOpen(true); };

  return (
    <>
      <PageHeader title="Products & inventory" actions={<Button onClick={() => openForm(null)}><Plus className="h-4 w-4" />Add product</Button>} />
      {alerts.length > 0 && (
        <div className="panel mb-6 flex items-center gap-3 border-warning/40 p-4 text-sm"><AlertTriangle className="h-4 w-4 shrink-0 text-warning" />{alerts.length} products need restocking: {alerts.map((p) => p.name).join(", ")}</div>
      )}
      <Panel>
        <DataTable head={["Product", "Quantity", "Price", "Sales", "Stock"]}>
          {products.map((p) => (
            <tr key={p.name} onClick={() => setViewName(p.name)} className="cursor-pointer hover:bg-secondary/50">
              <td className={td}><div className="flex items-center gap-3"><Thumb p={p} /><span className="font-medium">{p.name}</span></div></td>
              <td className={td}>{p.qty}</td><td className={td}>{egp(p.price)}</td><td className={`${td} text-muted-foreground`}>{p.sales} sold</td>
              <td className={td}><StatusPill status={stockStatus(p.qty)} /></td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewName(null)}>
        <SheetContent>
          {viewing && (
            <>
              <SheetHeader><SheetTitle>{viewing.name}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-5 px-4">
                <Thumb p={viewing} cls="h-48 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface p-3"><div className="eyebrow">Quantity</div><div className="mt-1 font-display text-2xl">{viewing.qty}</div></div>
                  <div className="rounded-lg bg-surface p-3"><div className="eyebrow">Price</div><div className="mt-1 font-display text-2xl">{egp(viewing.price)}</div></div>
                </div>
                <StatusPill status={stockStatus(viewing.qty)} />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => changeQty(viewing, 1)}><Plus className="h-4 w-4" />Increase</Button>
                  <Button variant="secondary" disabled={viewing.qty === 0} onClick={() => changeQty(viewing, -1)}><Minus className="h-4 w-4" />Decrease</Button>
                  <Button onClick={() => openForm(viewing)}><Pencil className="h-4 w-4" />Edit product</Button>
                  <Button variant="destructive" onClick={() => { setState((s) => ({ products: s.products.filter((x) => x.name !== viewing.name) })); setViewName(null); toast.success("Product deleted"); }}><Trash2 className="h-4 w-4" />Delete</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const next: Product = { ...(editing ?? { sales: 0, min: 10 }), image: img, name: String(d.get("name")).trim(), qty: Math.max(0, Number(d.get("qty"))), price: Math.max(0, Number(d.get("price"))) };
            if (!editing && products.some((p) => p.name === next.name)) { toast.error("A product with this name exists"); return; }
            setState((s) => ({ products: editing ? s.products.map((x) => x.name === editing.name ? next : x) : [...s.products, next] }));
            if (editing && viewName === editing.name) setViewName(next.name);
            toast.success(editing ? "Product updated" : "Product added");
            setFormOpen(false);
          }}>
            <Field label="Product name"><Input name="name" required maxLength={60} defaultValue={editing?.name} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity"><Input name="qty" type="number" min={0} required defaultValue={editing?.qty ?? 0} /></Field>
              <Field label="Price (EGP)"><Input name="price" type="number" min={0} required defaultValue={editing?.price ?? 0} /></Field>
            </div>
            <Field label="Product image"><Input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImg(await readFile(f)); }} /></Field>
            {img && <img src={img} alt="Preview" className="h-20 w-20 rounded-lg object-cover" />}
            <DialogFooter><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
