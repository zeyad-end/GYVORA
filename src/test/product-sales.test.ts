import { describe, expect, it } from "vitest";
import { productSchema, saveProduct, totalSales, updateSoldQuantity } from "../lib/product-sales";
const product = { id: "product-1", name: "Shaker", image: "", qty: 0, min: 10, sales: 1, price: 240 };
describe("gym product sales", () => {
  it("starts with the entered quantity sold and multiplies by unit price", () => {
    const rows = saveProduct([], product);
    expect(rows[0]?.sales).toBe(1);
    expect(totalSales(product)).toBe(240);
  });
  it("increments and directly updates the same product without changing inventory", () => {
    const increased = updateSoldQuantity([product], "product-1", 2);
    const direct = updateSoldQuantity(increased, "product-1", 7);
    expect(direct).toHaveLength(1);
    expect(direct[0]?.qty).toBe(0);
    expect(direct[0]?.sales).toBe(7);
    expect(totalSales(direct[0] ?? product)).toBe(1680);
  });
  it("allows zero but rejects negative and fractional sold quantities", () => {
    expect(updateSoldQuantity([product], "product-1", 0)[0]?.sales).toBe(0);
    expect(() => updateSoldQuantity([product], "product-1", -1)).toThrow();
    expect(() => updateSoldQuantity([product], "product-1", 1.5)).toThrow();
  });
  it("renames and reprices a product without duplication and recalculates total", () => {
    const rows = saveProduct([product], { ...product, name: "New shaker", price: 300, sales: 4 }, "product-1");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("product-1");
    expect(totalSales(rows[0] ?? product)).toBe(1200);
  });
  it("rejects empty names, negative prices and duplicate product names", () => {
    expect(productSchema.safeParse({ ...product, name: " " }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, price: -1 }).success).toBe(false);
    expect(() => saveProduct([product], { ...product, id: "other", name: "shaker" })).toThrow();
  });
});