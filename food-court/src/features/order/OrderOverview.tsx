import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronLeft,
  CookingPot,
  Download,
  MapPin,
  Phone,
  Receipt,
  ShoppingBag,
  X,
} from "lucide-react";
import { socket } from "../../lib/socket";
import {
  isFinished,
  notificationPermission,
  requestNotificationPermission,
} from "../../lib/notify";
import { useRestro } from "../restro/useRestro";
import { useMenusByOwner } from "../menuFeatures/useMenusByOwner";
import { order as orderService } from "./order";
import NoData from "../../ui/NoData";
import BackdropLoader from "../../components/BackdropLoader";
import { Order, OrderItem } from "../../types/orderType";
import { MenuItem } from "../../types/menuType";

const statusMessages: Record<
  Order["status"],
  { title: string; text: string; className: string }
> = {
  new: {
    title: "Order received",
    text: "Waiting for the restaurant to accept your order.",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  preparing: {
    title: "Being prepared",
    text: "The restaurant accepted your order and is cooking it now.",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  completed: {
    title: "Order completed",
    text: "Your order is ready. Enjoy your meal!",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    title: "Order cancelled",
    text: "This order was cancelled and will not be prepared.",
    className: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

const money = (amount: number) => `₹${amount.toFixed(2)}`;

const itemName = (item: OrderItem, menus: MenuItem[] | undefined) =>
  typeof item.menuItem === "object"
    ? (item.menuItem as { name: string }).name
    : (menus?.find((m) => m._id === item.menuItem)?.name ?? "Item");

// Opens any UPI app with the payee and amount already filled in. On a desktop
// browser nothing is registered for upi://, so the QR code stays as the way to pay.
const upiLink = (upiId: string, name: string, order: Order) => {
  // Percent-encode each value: URLSearchParams would write spaces as "+",
  // which some UPI apps show literally in the payee name.
  const params = {
    pa: upiId,
    pn: name,
    am: order.totalAmount.toFixed(2),
    cu: "INR",
    tn: `Order ${order._id.slice(-6).toUpperCase()}`,
  };
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `upi://pay?${query}`;
};

function OrderOverview() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { isLoading, data, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrder(id || "0"),
  });

  // Live status updates pushed by the API when the restaurant changes the order.
  useEffect(() => {
    if (!id) return;
    const join = () => socket.emit("join:order", id);
    const onUpdated = (updated: Order) => {
      if (updated._id !== id) return;
      const previous = queryClient.getQueryData<Order>(["order", id]);
      queryClient.setQueryData(["order", id], updated);
      if (previous && previous.status !== updated.status)
        toast(statusMessages[updated.status].title, { icon: "🔔" });
    };
    join();
    socket.on("connect", join);
    socket.on("order:updated", onUpdated);
    return () => {
      socket.emit("leave:order", id);
      socket.off("connect", join);
      socket.off("order:updated", onUpdated);
    };
  }, [id, queryClient]);

  if (isLoading) return <BackdropLoader />;
  if (!id || error || !data) return <NoData />;

  const status = statusMessages[data.status];

  return (
    <section className="bg-gray-50 py-6 antialiased dark:bg-gray-900 md:py-10">
      <div className="mx-auto max-w-3xl px-4">
        <button
          onClick={() => navigate(`/menu/${data.owner}`)}
          className="mb-5 flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400"
        >
          <ChevronLeft className="h-4 w-4" /> Back to menu
        </button>

        <div className="space-y-4">
          <OrderHeader order={data} />

          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${status.className}`}
          >
            {data.status === "cancelled" ? (
              <X className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-current" />
            )}
            <div>
              <p className="font-semibold">{status.title}</p>
              <p className="text-sm">{status.text}</p>
              {data.status !== "cancelled" && data.status !== "completed" && (
                <p className="mt-1 text-xs opacity-75">
                  This page updates automatically — no need to refresh.
                </p>
              )}
            </div>
          </div>

          {data.status !== "cancelled" && <Progress order={data} />}

          {!isFinished(data.status) && <NotifyPrompt />}

          <ItemsCard order={data} />
          <PaymentCard order={data} />
          <Actions order={data} />
        </div>
      </div>
    </section>
  );
}

// Offered while an order is unfinished, for a customer who dismissed the
// prompt at checkout. It disappears once alerts are on, or if the browser
// has blocked them, since asking again would do nothing.
const NotifyPrompt: FC = () => {
  const [permission, setPermission] = useState(notificationPermission());

  if (permission !== "default") return null;

  return (
    <button
      onClick={async () => {
        await requestNotificationPermission(true);
        setPermission(notificationPermission());
      }}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
    >
      <Bell className="h-5 w-5 shrink-0 text-gray-500" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-900">
          Get told when it is ready
        </span>
        <span className="block text-xs text-gray-500">
          We will alert this browser until your order is done.
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold underline">Turn on</span>
    </button>
  );
};

// Order number, time and which restaurant it was placed with.
const OrderHeader: FC<{ order: Order }> = ({ order }) => {
  const { restro } = useRestro(order.owner);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {restro?.restroLogo ? (
        <img
          src={restro.restroLogo}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-gray-200"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
          <Receipt className="h-6 w-6" />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Order #{order._id.slice(-6).toUpperCase()}
        </h1>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
          {restro?.restroName ?? "Restaurant"}
          {order.createdAt &&
            ` · ${new Date(order.createdAt).toLocaleString([], {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </p>
        <p className="mt-0.5 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {order.delivery}
        </p>
      </div>
    </div>
  );
};

// Three plain steps, so it is obvious what has happened and what is next.
const Progress: FC<{ order: Order }> = ({ order }) => {
  const { menus } = useMenusByOwner(order.owner);

  const ordered = menus?.filter((m) =>
    order.items.some((i) => i.menuItem === m._id),
  );
  const prepMinutes = ordered?.length
    ? Math.round(
        Math.max(...ordered.map((m) => m.preparationTime)) * 1.2,
      )
    : null;

  const steps = [
    { label: "Placed", Icon: ShoppingBag, done: true },
    {
      label: "Preparing",
      Icon: CookingPot,
      done: order.status === "preparing" || order.status === "completed",
      note:
        order.status === "preparing" && prepMinutes
          ? `~${prepMinutes} min`
          : undefined,
    },
    {
      label: "Ready",
      Icon: Check,
      done: order.status === "completed",
    },
  ];

  return (
    <ol className="flex items-start justify-between gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {steps.map(({ label, Icon, done, note }, i) => (
        <li key={label} className="flex flex-1 items-start gap-2">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                done ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <div className="min-w-0 pt-1">
            <p
              className={`text-sm font-medium ${
                done ? "text-gray-900 dark:text-white" : "text-gray-400"
              }`}
            >
              {label}
            </p>
            {note && (
              <p className="whitespace-nowrap text-xs text-gray-500">{note}</p>
            )}
          </div>
          {i < steps.length - 1 && (
            <span
              className={`mt-4 hidden h-0.5 flex-1 sm:block ${
                steps[i + 1].done ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
};

const ItemsCard: FC<{ order: Order }> = ({ order }) => {
  const { menus } = useMenusByOwner(order.owner);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {order.items.map((item, idx) => {
          const product = menus?.find((m) => m._id === item.menuItem);
          return (
            <li key={item._id ?? idx} className="flex items-center gap-3 p-4">
              {product?.image && (
                <img
                  src={product.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-gray-900 dark:text-white">
                  {itemName(item, menus)}
                </span>
                {(item.selectedOptions?.length ?? 0) > 0 && (
                  <span className="block text-xs text-gray-500">
                    {item.selectedOptions!.map((o) => o.choice).join(", ")}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.quantity} × {money(item.price)}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-white">
                {money(item.price * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <span className="font-semibold text-gray-900 dark:text-white">
          Total
        </span>
        <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">
          {money(order.totalAmount)}
        </span>
      </div>
    </div>
  );
};

// How to pay: tap-to-pay on a phone, QR to scan, shown until the order is paid.
const PaymentCard: FC<{ order: Order }> = ({ order }) => {
  const { restro } = useRestro(order.owner);

  if (order.status === "cancelled") return null;
  if (!restro || (!restro.paymentQr && !restro.upiId)) return null;

  const paid = order.paymentStatus === "paid";
  const name = restro.restroName ?? "Restaurant";

  if (paid)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        <Check className="h-4 w-4 shrink-0" />
        Payment received — thank you!
      </div>
    );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="font-semibold text-gray-900 dark:text-white">
        Pay {money(order.totalAmount)}
      </h2>
      {restro.upiId && (
        <>
          <a
            href={upiLink(restro.upiId, name, order)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#178c2e] px-5 py-3 font-semibold text-white hover:bg-[#137225]"
          >
            Pay now with UPI app
          </a>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Opens GPay, PhonePe, Paytm or any UPI app on your phone.
          </p>
        </>
      )}
      {restro.paymentQr && (
        <>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {restro.upiId
              ? "On a computer? Scan this code instead:"
              : "Scan this code with any UPI app:"}
          </p>
          <img
            src={restro.paymentQr}
            alt={`Payment QR code for ${name}`}
            className="mx-auto mt-3 aspect-square w-full max-w-56 rounded-lg border border-gray-200 bg-white object-contain p-2"
          />
        </>
      )}
      <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
        Show the payment confirmation at the counter.
      </p>
    </div>
  );
};

// Only what the customer can actually do right now.
const Actions: FC<{ order: Order }> = ({ order }) => {
  const queryClient = useQueryClient();
  const { restro } = useRestro(order.owner);

  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: () => orderService.cancelOrder(order._id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["order", order._id], updated);
      toast.success("Your order was cancelled");
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(
        error.response?.data?.message ?? "Could not cancel this order",
      ),
  });

  // Cancelling is only possible before the restaurant accepts the order.
  const canCancel = order.status === "new";
  const canDownload = order.status === "completed";

  return (
    <div className="space-y-3">
      {canDownload && (
        <a
          href={orderService.receiptUrl(order._id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          <Download className="h-4 w-4" /> Download receipt
        </a>
      )}

      {canCancel && (
        <button
          onClick={() => {
            if (window.confirm("Cancel this order? This cannot be undone."))
              cancel();
          }}
          disabled={cancelling}
          className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
        >
          {cancelling ? "Cancelling…" : "Cancel this order"}
        </button>
      )}

      {order.status === "preparing" && (
        <p className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          The restaurant has started cooking, so this order can no longer be
          cancelled here.
          {restro?.restroAddress && (
            <span className="mt-2 flex items-center justify-center gap-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5" /> {restro.restroAddress}
            </span>
          )}
        </p>
      )}

      {order.status === "completed" && (
        <p className="text-center text-xs text-gray-500">
          Keep order #{order._id.slice(-6).toUpperCase()} for your records.
        </p>
      )}

      <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-gray-500">
        <Phone className="h-3.5 w-3.5" /> Questions? Ask at the counter with
        your order number.
      </p>
    </div>
  );
};

export default OrderOverview;
