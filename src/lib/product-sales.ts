import { z } from "zod";
import type { Product } from "./store";

export const soldQuantitySchema = z.number().finite().int("Quantity must be a whole number").min(0, "Quantity cannot be negative").max(Number.MAX_SAFE_INTEGER);
export const productSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  name: z.string().trim().min(1, "Enter a product name").max(60),
  image: z.string().max(7_000_000).optional(),
  price: z.number().finite().min(0, "Price cannot be negative").max(Number.MAX_SAFE_INTEGER),
  qty: soldQuantitySchema,
  sales: soldQuantitySchema,
  min: soldQuantitySchema,
}).refine((p) => Number.isFinite(p.price * p.sales) && p.price * p.sales <= Number.MAX_SAFE_INTEGER, "Total sales is too large");

export const productKey = (p: Product) => p.id ?? p.name;
export const totalSales = (p: Product) => p.price * p.sales;
export function saveProduct(rows: Product[], draft: Product, editingKey?: string) {
  const parsed = productSchema.parse(draft);
  if (rows.some((p) => productKey(p) !== editingKey && p.name.toLowerCase() === parsed.name.toLowerCase()))
    throw new Error("A product with this name exists");
  if (editingKey && !rows.some((p) => productKey(p) === editingKey)) throw new Error("Product no longer exists");
  return editingKey ? rows.map((p) => productKey(p) === editingKey ? parsed : p) : [...rows, parsed];
}
export function updateSoldQuantity(rows: Product[], key: string, quantity: number) {
  const sales = soldQuantitySchema.parse(quantity);
  if (!rows.some((p) => productKey(p) === key)) throw new Error("Product no longer exists");
  return rows.map((p) => productKey(p) === key ? productSchema.parse({ ...p, sales }) : p);
}