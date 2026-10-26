import { FC } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  Check,
  ChefHat,
  CircleCheckBig,
  IndianRupee,
  MapPin,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/orderType";
import { MenuItem } from "@/types/menuType";
import {
  formatMoney,
  itemName,
  optionSummary,
  paymentStyles,
  shortId,
  statusLabel,
  statusStyles,
  variantName,
} from "@/features/order/orderHelpers";

interface OrderCardProps {
  order: Order;
  menus: MenuItem[] | undefined;
  onStatus: (order: Order, status: Order["status"]) => void;
  onPaid: (order: Order) => void;
  onDelete: (order: Order) => void;
}

export const StatusBadge: FC<{ status: Order["status"] }> = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
  >
    {statusLabel[status]}
  </span>
);

const OrderCard: FC<OrderCardProps> = ({
  order,
  menus,
  onStatus,
  onPaid,
  onDelete,
}) => {
  const created = order.createdAt ? new Date(order.createdAt) : null;
  const isFresh =
    order.status === "new" &&
    created !== null &&
    Date.now() - created.getTime() < 2 * 60 * 1000;

  return (
    <article
      className={`flex flex-col rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isFresh ? "border-blue-300 ring-2 ring-blue-100" : "border-zinc-200"
      }`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-900">#{shortId(order._id)}</p>
          {created && (
            <p
              className="text-xs text-zinc-500"
              title={format(created, "dd MMM yyyy, HH:mm")}
            >
              {format(created, "HH:mm")} ·{" "}
              {formatDistanceToNow(created, { addSuffix: true })}
            </p>
          )}
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="space-y-1 px-4 py-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-medium text-zinc-900">
            {order.recipientName}
          </p>
          <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-600">
            {order.delivery}
          </span>
        </div>
        <a
          href={`tel:${order.recipientPhoneNumber}`}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900"
        >
          <Phone className="h-3.5 w-3.5" />
          {order.recipientPhoneNumber}
        </a>
        {order.delivery === "delivery" && order.deliveryAddress && (
          <p className="flex items-start gap-1.5 text-zinc-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {order.deliveryAddress}
          </p>
        )}
      </div>

      <ul className="mx-4 space-y-1.5 rounded-lg bg-zinc-50 px-3 py-2.5 text-sm">
        {order.items.map((item, i) => (
          <li key={item._id ?? i} className="flex justify-between gap-3">
            <span className="text-zinc-800">
              <span className="font-semibold">{item.quantity}×</span>{" "}
              {itemName(item, menus)}
              {variantName(item) && (
                <span className="text-zinc-500"> ({variantName(item)})</span>
              )}
              {optionSummary(item) && (
                <span className="block pl-5 text-xs text-zinc-500">
                  {optionSummary(item)}
                </span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-600">
              {formatMoney(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="text-zinc-500">
          <span className="capitalize">{order.paymentMethod}</span> ·{" "}
          <span
            className={`font-medium capitalize ${paymentStyles[order.paymentStatus]}`}
          >
            {order.paymentStatus}
          </span>
        </span>
        <span className="text-base font-bold tabular-nums text-zinc-900">
          {formatMoney(order.totalAmount)}
        </span>
      </div>

      <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-zinc-100 px-4 py-3">
        {order.status === "new" && (
          <>
            <Button
              className="h-11 flex-1 bg-emerald-600 text-base hover:bg-emerald-700"
              onClick={() => onStatus(order, "preparing")}
            >
              <Check /> Accept
            </Button>
            <Button
              variant="outline"
              className="h-11 text-base text-red-600 hover:text-red-700"
              onClick={() => onStatus(order, "cancelled")}
            >
              <X /> Reject
            </Button>
          </>
        )}
        {order.status === "preparing" && (
          <>
            <Button
              className="h-11 flex-1 text-base"
              onClick={() => onStatus(order, "completed")}
            >
              <CircleCheckBig /> Ready / Done
            </Button>
            <Button
              variant="outline"
              className="h-11 text-red-600 hover:text-red-700"
              onClick={() => onStatus(order, "cancelled")}
            >
              Cancel
            </Button>
          </>
        )}
        {order.status !== "cancelled" && order.paymentStatus !== "paid" && (
          <Button
            variant="secondary"
            className="h-10 w-full"
            onClick={() => onPaid(order)}
          >
            <IndianRupee /> Mark as paid
          </Button>
        )}
        {order.status === "cancelled" && (
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => onStatus(order, "preparing")}
          >
            <ChefHat /> Reopen
          </Button>
        )}
        {(order.status === "completed" || order.status === "cancelled") && (
          <Button
            size="icon"
            variant="ghost"
            className="ml-auto h-10 w-10 text-red-600 hover:text-red-700"
            aria-label="Delete order"
            onClick={() => onDelete(order)}
          >
            <Trash2 />
          </Button>
        )}
      </footer>
    </article>
  );
};

export default OrderCard;
