import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { BellRing, Check, Phone, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOrderSocket } from "@/features/order/useOrderSocket";
import {
  formatMoney,
  itemName,
  shortId,
  useOrderActions,
  variantName,
} from "@/features/order/orderHelpers";

// Pops up whenever a customer places an order, on any dashboard page.
const NewOrderPopup: FC = () => {
  const { incoming, dismiss } = useOrderSocket();
  const { setStatus, menus } = useOrderActions();
  const navigate = useNavigate();
  const order = incoming[0];

  if (!order) return null;

  const respond = async (status: "preparing" | "cancelled") => {
    dismiss(order._id);
    await setStatus(order, status);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && dismiss(order._id)}>
      <DialogContent className="bg-white sm:max-w-md">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <BellRing className="h-5 w-5 animate-bounce" />
          </span>
          <div>
            <DialogTitle className="text-lg font-bold text-zinc-900">
              New order #{shortId(order._id)}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              {order.createdAt && format(new Date(order.createdAt), "HH:mm")} ·{" "}
              <span className="capitalize">{order.delivery}</span>
              {incoming.length > 1 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                  +{incoming.length - 1} more waiting
                </span>
              )}
            </DialogDescription>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 p-3 text-sm">
          <p className="font-medium text-zinc-900">{order.recipientName}</p>
          <a
            href={`tel:${order.recipientPhoneNumber}`}
            className="flex items-center gap-1.5 text-zinc-500"
          >
            <Phone className="h-3.5 w-3.5" />
            {order.recipientPhoneNumber}
          </a>
          {order.deliveryAddress && (
            <p className="mt-1 text-zinc-500">{order.deliveryAddress}</p>
          )}
        </div>

        <ul className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg bg-zinc-50 p-3 text-sm">
          {order.items.map((item, i) => (
            <li key={item._id ?? i} className="flex justify-between gap-3">
              <span>
                <span className="font-semibold">{item.quantity}×</span>{" "}
                {itemName(item, menus)}
                {variantName(item) && (
                  <span className="text-zinc-500"> ({variantName(item)})</span>
                )}
              </span>
              <span className="tabular-nums text-zinc-600">
                {formatMoney(item.price * item.quantity)}
              </span>
            </li>
          ))}
          <li className="flex justify-between border-t border-zinc-200 pt-2 font-bold text-zinc-900">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(order.totalAmount)}</span>
          </li>
        </ul>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => respond("preparing")}
          >
            <Check /> Accept & start preparing
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => respond("cancelled")}
          >
            <X /> Reject
          </Button>
        </div>
        <button
          className="text-center text-sm text-zinc-500 hover:text-zinc-900 hover:underline"
          onClick={() => {
            dismiss(order._id);
            navigate("/dashboard/order");
          }}
        >
          Decide later — view in Orders
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderPopup;
