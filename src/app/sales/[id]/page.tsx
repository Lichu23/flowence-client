"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { salesApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { HelpButton } from "@/components/help/HelpModal";


type StockType = "venta" | "deposito";

type SaleItemDto = {
  id: string;
  product_id: string;
  product_name: string;
  product_barcode: string | null;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  stock_type: StockType;
};

type ReturnSummaryItem = {
  sale_item: { id: string; product_id: string; product_name: string; stock_type: StockType; quantity: number };
  returned_quantity: number;
  remaining_quantity: number;
  stock_current: number;
};

export default function SaleDetailsPage() {
  return (
    <ProtectedRoute>
      <SaleDetailsContent />
    </ProtectedRoute>
  );
}

function SaleDetailsContent() {
  
  const { user } = useAuth();
  const { currentStore } = useStore();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const saleId = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sale, setSale] = useState<{ id: string; receipt_number: string; payment_status: string; created_at: string } | null>(null);
  const [items, setItems] = useState<SaleItemDto[]>([]);
  const [summary, setSummary] = useState<ReturnSummaryItem[]>([]);
  const [returnedProducts, setReturnedProducts] = useState<Array<{ product_id: string; product_name: string; quantity: number; return_date: string; return_type: 'defective' | 'customer_mistake' }>>([]);

  // Inline editing state
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [types, setTypes] = useState<Record<string, "defective" | "customer_mistake">>({});

  useEffect(() => {
    const run = async () => {
      if (!currentStore || !saleId) return;
      setLoading(true);
      try {
        const details = await salesApi.getSale(currentStore.id, saleId);
        setSale({ id: details.sale.id, receipt_number: details.sale.receipt_number, payment_status: details.sale.payment_status, created_at: details.sale.created_at });
        setItems(details.items);
        const ret = await salesApi.getReturnsSummary(currentStore.id, saleId);
        setSummary(ret.items);
        // Fetch returned products
        const returned = await salesApi.getReturnedProducts(currentStore.id, saleId);
        setReturnedProducts(returned.returns);
        // Initialize editing state with defaults
        const sel: Record<string, boolean> = {};
        const qty: Record<string, number> = {};
        const t: Record<string, "defective" | "customer_mistake"> = {};
        ret.items.forEach((ri) => {
          const id = ri.sale_item.id;
          sel[id] = false;
          qty[id] = Math.min(ri.remaining_quantity, 0);
          t[id] = "customer_mistake";
        });
        setSelected(sel);
        setQuantities(qty);
        setTypes(t);
      } catch (e) {
        console.error(e);
        toast.error("No se pudieron cargar los detalles de la venta");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [currentStore, saleId, toast]);

  const rows = useMemo(() => {
    const byId: Record<string, SaleItemDto> = {};
    items.forEach((it) => (byId[it.id] = it));
    return summary.map((s) => ({
      item: byId[s.sale_item.id],
      summary: s,
    })).filter(r => !!r.item);
  }, [items, summary]);

  if (!user || !currentStore) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold">Venta {sale?.receipt_number}</h1>
          <button className="text-sm text-gray-600 hover:underline" onClick={() => router.back()}>Volver</button>
        </div>

        <div className="bg-white rounded-lg border p-3 mb-3 text-sm">
          <div className="flex flex-wrap gap-4">
            <div><span className="text-gray-500">Estado:</span> <span className="capitalize">{sale?.payment_status}</span></div>
            <div><span className="text-gray-500">Fecha:</span> {sale?.created_at ? new Date(sale.created_at).toLocaleString() : ""}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Cargando...</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Sin items</div>
          ) : (
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-2 text-left"><input type="checkbox" aria-label="Seleccionar todo"
                    checked={rows.every(r => selected[r.item.id])}
                    onChange={(e) => {
                      const val = e.target.checked;
                      const next: Record<string, boolean> = { ...selected };
                      rows.forEach(r => { next[r.item.id] = val; });
                      setSelected(next);
                    }}
                  /></th>
                  <th className="p-2 text-left">Producto</th>
                  <th className="p-2 text-right">Vendido</th>
                  <th className="p-2 text-right">Devuelto</th>
                  <th className="p-2 text-right">Restante</th>
                  <th className="p-2 text-right">Cantidad a devolver</th>
                  <th className="p-2 text-left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ item, summary: s }) => {
                  const maxQty = s.remaining_quantity;
                  const q = quantities[item.id] ?? 0;
                  const type = types[item.id] ?? "customer_mistake";
                  const canAct = maxQty > 0;
                  return (
                    <tr key={item.id} className={`border-b last:border-0 ${s.remaining_quantity === 0 ? "bg-green-50" : ""}`}>
                      <td className="p-2 align-top">
                        <input type="checkbox"
                          disabled={!canAct}
                          checked={!!selected[item.id]}
                          onChange={(e) => setSelected(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        />
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-xs text-gray-500">{item.stock_type === "venta" ? "Piso de venta" : "Depósito"}</div>
                      </td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{s.returned_quantity}</td>
                      <td className="p-2 text-right">{s.remaining_quantity}</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          className="w-24 px-2 py-1 border rounded text-right disabled:opacity-50"
                          min={0}
                          max={maxQty}
                          value={q}
                          disabled={!canAct}
                          onChange={(e) => {
                            const val = Number(e.target.value || 0);
                            const clamped = Math.max(0, Math.min(maxQty, isNaN(val) ? 0 : val));
                            setQuantities(prev => ({ ...prev, [item.id]: clamped }));
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          className="px-2 py-1 border rounded disabled:opacity-50"
                          value={type}
                          disabled={!canAct}
                          onChange={(e) => setTypes(prev => ({ ...prev, [item.id]: e.target.value as 'customer_mistake' | 'defective' }))}
                        >
                          <option value="customer_mistake">Error del cliente</option>
                          <option value="defective">Defectuoso</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Returned Products Section */}
        {returnedProducts.length > 0 && (
          <div className="bg-white rounded-lg border mt-4">
            <div className="p-3 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Productos Devueltos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-right">Cantidad</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Fecha de Devolución</th>
                  </tr>
                </thead>
                <tbody>
                  {returnedProducts.map((ret, idx) => (
                    <tr key={`${ret.product_id}-${idx}`} className="border-b last:border-0">
                      <td className="p-2">{ret.product_name}</td>
                      <td className="p-2 text-right">{ret.quantity}</td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${ret.return_type === 'defective' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {ret.return_type === 'defective' ? 'Defectuoso' : 'Error del cliente'}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-600">{new Date(ret.return_date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end mt-3">
          <button
            className="px-4 py-2 border rounded disabled:opacity-50"
            onClick={() => router.back()}
            disabled={saving}
          >Cancelar</button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            disabled={saving || !rows.some(r => r.summary.remaining_quantity > 0)}
            onClick={async () => {
              if (!currentStore || !saleId) return;
              if (!confirm('¿Confirmar devolución completa de todos los items restantes?')) return;
              
              const payload = rows
                .filter(r => r.summary.remaining_quantity > 0)
                .map(r => ({
                  sale_item_id: r.item.id,
                  product_id: r.item.product_id,
                  stock_type: r.item.stock_type,
                  quantity: r.summary.remaining_quantity,
                  return_type: "customer_mistake" as const
                }));
              
              if (payload.length === 0) return;
              setSaving(true);
              try {
                const result = await salesApi.returnItemsBatch(currentStore.id, saleId, payload);
                setSummary(result.summary.items);
                const nextSel: Record<string, boolean> = {};
                const nextQty: Record<string, number> = {};
                rows.forEach(r => { nextSel[r.item.id] = false; nextQty[r.item.id] = 0; });
                setSelected(nextSel);
                setQuantities(nextQty);
                toast.success("Devolución completa procesada");
              } catch (e) {
                const err = e as Error;
                console.error(err);
                toast.error(err.message || "No se pudo procesar la devolución completa");
              } finally {
                setSaving(false);
              }
            }}
          >Devolver todo</button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={saving || !rows.some(r => selected[r.item.id] && (quantities[r.item.id] ?? 0) > 0)}
            onClick={async () => {
              if (!currentStore || !saleId) return;
              const payload = rows
                .filter(r => selected[r.item.id])
                .map(r => ({
                  sale_item_id: r.item.id,
                  product_id: r.item.product_id,
                  stock_type: r.item.stock_type,
                  quantity: Math.max(0, Math.min(r.summary.remaining_quantity, quantities[r.item.id] ?? 0)),
                  return_type: types[r.item.id] ?? "customer_mistake"
                }))
                .filter(p => p.quantity > 0);
              if (payload.length === 0) return;
              setSaving(true);
              try {
                const result = await salesApi.returnItemsBatch(currentStore.id, saleId, payload);
                // Optimistically update UI with returned summary
                setSummary(result.summary.items);
                // Reset edited state for processed items
                const nextSel = { ...selected };
                const nextQty = { ...quantities };
                payload.forEach(p => { nextSel[p.sale_item_id] = false; nextQty[p.sale_item_id] = 0; });
                setSelected(nextSel);
                setQuantities(nextQty);
                toast.success("Devoluciones procesadas");
              } catch (e) {
                const err = e as Error;
                console.error(err);
                toast.error(err.message || "No se pudieron procesar las devoluciones");
              } finally {
                setSaving(false);
              }
            }}
          >{saving ? "Procesando..." : "Confirmar devoluciones seleccionadas"}</button>
        </div>
      </main>

      <HelpButton />
    </div>
  );
}
