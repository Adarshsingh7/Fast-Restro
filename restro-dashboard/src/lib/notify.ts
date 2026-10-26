// One place for every alert sent to the restaurant owner: a browser
// notification when the dashboard is in the background, a chime, and a toast.
// Any feature that needs to reach the owner should call notifyAdmin().
import { toast } from "sonner";

export type AdminNotice = {
  /** Groups notices: a second notice with the same tag replaces the first. */
  tag: string;
  title: string;
  body: string;
  /** Opened when the owner clicks the notification. */
  url?: string;
  sound?: boolean;
  /** Skip the in-page toast, e.g. when a dialog already shows the same thing. */
  silentInApp?: boolean;
};

const PERMISSION_KEY = "notificationsAsked";

export const notificationsSupported = () => "Notification" in window;

export const notificationPermission = (): NotificationPermission | "unsupported" =>
  notificationsSupported() ? Notification.permission : "unsupported";

/**
 * Asks for browser notification permission. Browsers only show the prompt in
 * response to a click, so call this from a user action such as logging in.
 * Automatic calls ask once per browser; `force` is for an explicit button.
 */
export const requestNotificationPermission = async (
  force = false,
): Promise<boolean> => {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  // Asking again after a refusal does nothing, so don't pester.
  if (Notification.permission === "denied") return false;
  if (!force && localStorage.getItem(PERMISSION_KEY) === "asked") return false;

  try {
    const result = await Notification.requestPermission();
    localStorage.setItem(PERMISSION_KEY, "asked");
    return result === "granted";
  } catch {
    return false;
  }
};

// Short two-note chime, so an alert is noticed in a noisy kitchen.
const playChime = () => {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.18;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  } catch {
    // Browsers block audio until the page has been interacted with.
  }
};

/** Sends one notice to the owner through every channel that is available. */
export const notifyAdmin = ({
  tag,
  title,
  body,
  url,
  sound = true,
  silentInApp = false,
}: AdminNotice) => {
  if (sound) playChime();

  if (!silentInApp) toast(title, { description: body });

  // A browser notification would duplicate what is already on screen.
  if (document.visibilityState === "visible") return;

  if (notificationPermission() !== "granted") return;

  try {
    const notification = new Notification(title, { body, tag });
    notification.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      notification.close();
    };
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
};
