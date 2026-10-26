// Browser notifications for the customer, who has no account.
//
// Permission belongs to the browser and the site, not to a user, so asking
// once per browser is enough. Alerts only run while an order is unfinished:
// the last one is sent when the order is completed or cancelled, and nothing
// is sent again until this browser places another order.
import { Order } from "../types/orderType";

const ASKED_KEY = "notifyAsked";

export const notificationsSupported = () => "Notification" in window;

export const notificationPermission = ():
  | NotificationPermission
  | "unsupported" =>
  notificationsSupported() ? Notification.permission : "unsupported";

/**
 * Asks for permission to show order updates. Browsers only show the prompt
 * during a click, so call this from the "Place order" press or a button.
 * Automatic calls ask once per browser; `force` is for an explicit button.
 */
export const requestNotificationPermission = async (
  force = false,
): Promise<boolean> => {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  // Asking again after a refusal does nothing, so don't pester.
  if (Notification.permission === "denied") return false;
  if (!force && localStorage.getItem(ASKED_KEY) === "yes") return false;

  try {
    const result = await Notification.requestPermission();
    localStorage.setItem(ASKED_KEY, "yes");
    return result === "granted";
  } catch {
    return false;
  }
};

const messages: Record<Order["status"], { title: string; body: string }> = {
  new: {
    title: "Order sent to the kitchen",
    body: "Waiting for the restaurant to accept it.",
  },
  preparing: {
    title: "Your order was accepted",
    body: "The kitchen has started cooking.",
  },
  completed: {
    title: "Your order is ready",
    body: "Collect it at the counter. Enjoy your meal!",
  },
  cancelled: {
    title: "Your order was cancelled",
    body: "Please speak to the restaurant.",
  },
};

/** True once an order needs no further alerts. */
export const isFinished = (status: Order["status"]) =>
  status === "completed" || status === "cancelled";

/**
 * Shows the browser notification for an order's new status. It is skipped
 * while the customer is looking at the page, since the page already shows
 * the change itself.
 */
export const notifyOrderStatus = (order: Order) => {
  if (notificationPermission() !== "granted") return;
  if (document.visibilityState === "visible") return;

  const message = messages[order.status];
  if (!message) return;

  try {
    const notification = new Notification(message.title, {
      body: `#${order._id.slice(-6).toUpperCase()} · ${message.body}`,
      // One notification per order: a newer status replaces the older one.
      tag: `order-${order._id}`,
      requireInteraction: order.status === "completed",
    });
    notification.onclick = () => {
      window.focus();
      window.location.href = `/order/${order._id}`;
      notification.close();
    };
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
};
