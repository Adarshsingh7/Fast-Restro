import { useMenu } from "@/features/menuFeatures/useMenu";
import { useUpdateOrder } from "./useOrder";
import { Order, OrderItem } from "@/types/orderType";
import { MenuItem } from "@/types/menuType";

export const statusStyles: Record<Order["status"], string> = {
  new: "bg-blue-50 text-blue-700 ring-blue-200",
  preparing: "bg-amber-50 text-amber-700 ring-amber-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-zinc-100 text-zinc-500 ring-zinc-200",
};

export const paymentStyles: Record<Order["paymentStatus"], string> = {
  pending: "text-amber-700",
  paid: "text-emerald-700",
  failed: "text-red-600",
};

export const statusLabel: Record<Order["status"], string> = {
  new: "New",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const shortId = (id: string) => id.slice(-6).toUpperCase();

export const formatMoney = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const itemName = (item: OrderItem, menus: MenuItem[] | undefined) => {
  if (typeof item.menuItem === "object") return item.menuItem.name;
  return menus?.find((m) => m._id === item.menuItem)?.name ?? "Unknown item";
};

export const variantName = (item: OrderItem) => {
  const v = item.variant as unknown;
  if (!v) return "";
  if (typeof v === "string") return v;
  return (v as { name?: string }).name ?? "";
};

// Status/payment changes send the full order (with item names) so the API can
// email the customer the same way the edit form does.
export const useOrderActions = () => {
  const { updateOrder } = useUpdateOrder();
  const { data: menus } = useMenu();

  const withNames = (order: Order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item, name: itemName(item, menus) })),
  });

  const setStatus = (order: Order, status: Order["status"]) =>
    updateOrder({ id: order._id, updatedData: { ...withNames(order), status } });

  const setPayment = (order: Order, paymentStatus: Order["paymentStatus"]) =>
    updateOrder({
      id: order._id,
      updatedData: { ...order, update: true, paymentStatus },
    });

  return { setStatus, setPayment, menus };
};
