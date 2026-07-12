"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createOrder,
  toggleOrder,
  deleteOrder,
  type OrderFormState,
} from "@/lib/actions/orders";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui";
import { TrashIcon } from "@/components/icons";
import { useT } from "@/components/LanguageProvider";
import { cn, formatEventDate, formatEventDateTime } from "@/lib/utils";
import {
  ORDER_CATEGORIES,
  type OrderCategory,
  type OrderItem,
} from "@/lib/constants";

type OrderRow = {
  id: string;
  category: OrderCategory;
  items: OrderItem[];
  description: string | null;
  needed_date: string;
  needed_time: string;
  done: boolean;
  created_at: string;
  completed_at: string | null;
  creatorName: string | null;
  completerName: string | null;
};

const CATEGORY_BADGE: Record<OrderCategory, string> = {
  munition: "bg-amber-100 text-amber-800",
  material: "bg-blue-100 text-blue-700",
  fahrzeug: "bg-violet-100 text-violet-700",
  platz: "bg-cyan-100 text-cyan-700",
  zwipf: "bg-rose-100 text-rose-700",
};

function isOverdue(o: OrderRow): boolean {
  const needed = new Date(`${o.needed_date}T${o.needed_time.slice(0, 5)}`);
  return !o.done && needed.getTime() < Date.now();
}

export function OrderManager({ orders }: { orders: OrderRow[] }) {
  const t = useT();
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<OrderCategory | "all">("all");

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.category === filter);

  return (
    <div className="space-y-4">
      {creating ? (
        <Card className="p-4">
          <h2 className="mb-3 font-medium text-slate-900">{t("orders.new")}</h2>
          <OrderForm onDone={() => setCreating(false)} />
        </Card>
      ) : (
        <Button onClick={() => setCreating(true)}>
          {t("orders.newButton")}
        </Button>
      )}

      <div className="flex flex-wrap gap-1">
        {(["all", ...ORDER_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap",
              filter === c
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-200",
            )}
          >
            {c === "all" ? t("filter.all") : t(`cat.${c}`)}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("orders.empty")}
        </p>
      ) : shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          {t("orders.noMatch")}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((o) => {
            const overdue = isOverdue(o);
            return (
              <li key={o.id}>
                <Card className={cn("p-4", o.done && "opacity-60")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={CATEGORY_BADGE[o.category]}>
                          {t(`cat.${o.category}`)}
                        </Badge>
                        {o.done ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {t("orders.done")}
                          </Badge>
                        ) : overdue ? (
                          <Badge className="bg-red-100 text-red-700">
                            {t("orders.overdue")}
                          </Badge>
                        ) : null}
                      </div>
                      <table
                        className={cn(
                          "mt-2 text-sm text-slate-900",
                          o.done && "line-through",
                        )}
                      >
                        <thead>
                          <tr className="text-left text-xs text-slate-500">
                            <th className="pr-4 font-medium">
                              {t("orders.qty")}
                            </th>
                            <th className="font-medium">{t("field.name")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items.map((it, i) => (
                            <tr key={i}>
                              <td className="pr-4 tabular-nums">
                                {it.quantity}
                              </td>
                              <td className="font-medium">{it.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p
                        className={cn(
                          "mt-2 text-sm",
                          overdue ? "text-red-600" : "text-slate-500",
                        )}
                      >
                        {t("orders.neededLabel", {
                          datetime: formatEventDateTime(
                            o.needed_date,
                            o.needed_time,
                          ),
                        })}
                      </p>
                      <p className="text-sm text-slate-500">
                        {t("orders.orderedBy", {
                          name: o.creatorName ?? t("common.dash"),
                          date: formatEventDate(o.created_at.slice(0, 10)),
                        })}
                      </p>
                      {o.description && (
                        <p className="mt-1 text-sm whitespace-pre-line text-slate-700">
                          {o.description}
                        </p>
                      )}
                      {o.done && o.completed_at && (
                        <p className="mt-1 text-sm text-emerald-700">
                          {t("orders.completedBy", {
                            name: o.completerName ?? t("common.dash"),
                            date: formatEventDate(o.completed_at.slice(0, 10)),
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <form action={toggleOrder}>
                        <input type="hidden" name="id" value={o.id} />
                        <input
                          type="hidden"
                          name="done"
                          value={o.done ? "false" : "true"}
                        />
                        <Button
                          size="sm"
                          variant={o.done ? "ghost" : "secondary"}
                          type="submit"
                        >
                          {o.done ? t("orders.markOpen") : t("orders.markDone")}
                        </Button>
                      </form>
                      <form
                        action={deleteOrder}
                        onSubmit={(e) => {
                          if (!window.confirm(t("orders.deleteConfirm")))
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={o.id} />
                        <Button size="sm" variant="danger" type="submit">
                          <TrashIcon className="h-4 w-4" />
                          {t("common.delete")}
                        </Button>
                      </form>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrderForm({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(
    createOrder,
    undefined,
  );
  // Row keys for the item table (inputs stay uncontrolled).
  const [rows, setRows] = useState<number[]>([0]);

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  const addRow = () =>
    setRows((r) => [...r, (r.length ? Math.max(...r) : 0) + 1]);
  const removeRow = (key: number) =>
    setRows((r) => (r.length > 1 ? r.filter((k) => k !== key) : r));

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="order-category">{t("orders.category")}</Label>
        <Select id="order-category" name="category" required defaultValue="">
          <option value="" disabled>
            {t("orders.chooseCategory")}
          </option>
          {ORDER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(`cat.${c}`)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{t("orders.items")}</Label>
        <div className="space-y-2">
          <div className="flex gap-2 text-xs font-medium text-slate-500">
            <span className="w-24">{t("orders.qty")}</span>
            <span className="flex-1">{t("field.name")}</span>
            <span className="w-9" aria-hidden="true" />
          </div>
          {rows.map((key) => (
            <div key={key} className="flex gap-2">
              <Input
                name="item_quantity"
                type="number"
                min={1}
                step={1}
                required
                className="w-24"
                aria-label={t("orders.qty")}
              />
              <Input
                name="item_name"
                required
                className="flex-1"
                placeholder={t("orders.itemPlaceholder")}
                aria-label={t("field.name")}
              />
              <Button
                type="button"
                variant="ghost"
                className="h-11 w-9 shrink-0 px-0"
                onClick={() => removeRow(key)}
                disabled={rows.length === 1}
                aria-label={t("orders.removeItem")}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            {t("orders.addItem")}
          </Button>
        </div>
      </div>
      <div>
        <Label>{t("orders.neededBy")}</Label>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              name="needed_date"
              type="date"
              required
              aria-label={t("field.date")}
            />
          </div>
          <div className="flex-1">
            <Input
              name="needed_time"
              type="time"
              required
              aria-label={t("field.time")}
            />
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="order-description">{t("field.description")}</Label>
        <Textarea
          id="order-description"
          name="description"
          rows={3}
          placeholder={t("orders.descPlaceholder")}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {t("orders.create")}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
