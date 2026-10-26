import { FC, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useDialog } from "@/context/DialogContext";
import { useDeleteOrder, useOrders } from "@/features/order/useOrder";
import { useOrderActions } from "@/features/order/orderHelpers";
import CenteredLoader from "@/ui/CenteredLoader";
import OrderCard from "@/components/OrderCard";
import { Order as OrderType } from "@/types/orderType";

type View = "new" | "preparing" | "done";

// Only the most recent finished orders are shown to keep the screen light.
const DONE_LIMIT = 20;

const byOldest = (a: OrderType, b: OrderType) =>
  new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();

const emptyText: Record<View, string> = {
  new: "No new orders. They will pop up here as soon as a customer orders.",
  preparing: "Nothing in the kitchen right now.",
  done: "No finished orders yet.",
};

const Order: FC = () => {
  const { openDeleteDialog } = useDialog();
  const { orders, isLoading } = useOrders();
  const { deleteOrder } = useDeleteOrder();
  const { setStatus, setPayment, menus } = useOrderActions();
  const [view, setView] = useState<View>("new");

  if (isLoading || !orders)
    return (
      <CenteredLoader
        blurIntensity="low"
        fadeIn={true}
        type="dots"
        color="green"
      />
    );

  const lists: Record<View, OrderType[]> = {
    // Oldest first so the kitchen works through orders in arrival order.
    new: orders.filter((o) => o.status === "new").sort(byOldest),
    preparing: orders.filter((o) => o.status === "preparing").sort(byOldest),
    done: orders
      .filter((o) => o.status === "completed" || o.status === "cancelled")
      .sort((a, b) => byOldest(b, a))
      .slice(0, DONE_LIMIT),
  };

  const tabs: { key: View; label: string; dot: string }[] = [
    { key: "new", label: "New", dot: "bg-blue-500" },
    { key: "preparing", label: "Preparing", dot: "bg-amber-500" },
    { key: "done", label: "Done", dot: "bg-emerald-500" },
  ];

  const list = lists[view];

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[61px] z-10 -mx-4 bg-zinc-50/95 px-4 pb-2 backdrop-blur">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-200/70 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                view === t.key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${t.dot}`} />
              {t.label}
              {t.key !== "done" && lists[t.key].length > 0 && (
                <span className="rounded-full bg-zinc-900 px-1.5 text-xs text-white">
                  {lists[t.key].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {list.length ? (
        list.map((o) => (
          <OrderCard
            key={o._id}
            order={o}
            menus={menus}
            onStatus={setStatus}
            onPaid={(order) => setPayment(order, "paid")}
            onDelete={(order) =>
              openDeleteDialog(() => deleteOrder({ id: order._id }))
            }
          />
        ))
      ) : (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
          <ClipboardList className="mb-2 h-7 w-7 text-zinc-400" />
          {emptyText[view]}
        </div>
      )}
    </div>
  );
};

export default Order;
