import { FC, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ClipboardList,
  CookingPot,
  Download,
  RotateCcw,
  Store,
} from "lucide-react";
import { order as orderService } from "./order";
import { useOngoingOrders } from "./useOngoingOrders";
import { useRestro } from "../restro/useRestro";
import { useMenusByOwner } from "../menuFeatures/useMenusByOwner";
import { appendLocalEntry } from "../../utils/manageLocalEntry";
import { Order } from "../../types/orderType";

type Filter = "all" | "active" | "completed" | "cancelled";

const statusStyles: Record<Order["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  preparing: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<Order["status"], string> = {
  new: "Waiting",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const money = (amount: number) => `₹${amount.toFixed(2)}`;

const isActive = (o: Order) => o.status === "new" || o.status === "preparing";

const timeLabel = (value: Order["createdAt"]) => {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : date.toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const OrderCard: FC<{ order: Order; onReorder: (o: Order) => void }> = ({
  order,
  onReorder,
}) => {
  const { restro } = useRestro(order.owner);
  const { menus } = useMenusByOwner(order.owner);

  const names = order.items
    .map(
      (item) =>
        `${item.quantity}× ${
          menus?.find((m) => m._id === item.menuItem)?.name ?? "Item"
        }`,
    )
    .join(", ");

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {restro?.restroLogo ? (
          <img
            src={restro.restroLogo}
            alt=""
            className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-gray-200"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            <Store className="h-5 w-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {restro?.restroName ?? "Restaurant"}
              </p>
              <p className="text-xs text-gray-500">
                #{order._id.slice(-6).toUpperCase()} ·{" "}
                {timeLabel(order.createdAt)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{names}</p>

          <p className="mt-1 font-bold text-gray-900">
            {money(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* The main action gets its own row so nothing is squeezed on a phone. */}
      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
        {isActive(order) ? (
          <Link
            to={`/order/${order._id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white"
          >
            <CookingPot className="h-4 w-4" /> Track order
          </Link>
        ) : (
          <Link
            to={`/order/${order._id}`}
            className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            View details
          </Link>
        )}

        {!isActive(order) && (
          <div className="grid grid-cols-2 gap-2">
            {order.status === "completed" && (
              <a
                href={orderService.receiptUrl(order._id)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" /> Receipt
              </a>
            )}
            <button
              onClick={() => onReorder(order)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 ${
                order.status === "completed" ? "" : "col-span-2"
              }`}
            >
              <RotateCcw className="h-4 w-4" /> Order again
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default function History() {
  const { all } = useOngoingOrders();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  const { mutate: reorder } = useMutation({
    mutationFn: (current: Order) =>
      orderService.createOrder({
        ...current,
        _id: undefined,
        status: "new",
        paymentStatus: "pending",
        createdAt: undefined,
      }),
    onSuccess: (created) => {
      appendLocalEntry(created._id);
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      toast.success("Order placed again");
      navigate(`/order/${created._id}`);
    },
    onError: () => toast.error("Could not place that order again"),
  });

  const orders = [...all].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime(),
  );

  const counts: Record<Filter, number> = {
    all: orders.length,
    active: orders.filter(isActive).length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const visible = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active") return isActive(o);
    return o.status === filter;
  });

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Ongoing" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const handleReorder = (current: Order) => {
    if (
      window.confirm(
        `Place this order again for ${money(current.totalAmount)}?`,
      )
    )
      reorder(current);
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50">
      <header className="bg-white px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-gray-900">My orders</h1>
        <p className="text-sm text-gray-500">
          Orders placed from this device in the last 7 days.
        </p>
      </header>

      {orders.length > 0 && (
        <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-xs ${
                    filter === tab.key ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 px-4 py-4">
        {visible.length ? (
          visible.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onReorder={handleReorder}
            />
          ))
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <ClipboardList className="mb-2 h-7 w-7 text-gray-400" />
            <p className="font-medium text-gray-900">
              {orders.length ? "Nothing here" : "No orders yet"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length
                ? "Try another filter."
                : "Your orders will appear here once you place one."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
