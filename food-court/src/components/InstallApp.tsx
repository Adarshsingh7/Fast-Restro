import { FC, useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

// Chrome fires this before showing its own install UI; keeping the event lets
// the page offer installing at a moment that makes sense.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "installDismissed";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // iOS reports standalone on navigator, not through display-mode.
  (navigator as unknown as { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios/i.test(navigator.userAgent);

/**
 * Offers to install the menu as an app. Chrome and Android get a one-tap
 * install; iOS Safari has no install API, so it gets the Share-sheet steps.
 */
const InstallApp: FC<{ restroName?: string }> = ({ restroName }) => {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [hidden, setHidden] = useState(
    () => isStandalone() || localStorage.getItem(DISMISSED_KEY) === "yes",
  );

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setHidden(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Nothing to offer: already installed, dismissed, or a browser that cannot.
  if (hidden || (!prompt && !isIos())) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "yes");
    setHidden(true);
  };

  const install = async () => {
    if (!prompt) return setShowIosHelp(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setHidden(true);
  };

  return (
    <div className="mx-4 mb-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <img
          src="/pwa-192x192.png"
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Add {restroName ?? "this menu"} to your home screen
          </p>
          <p className="text-xs text-gray-500">
            Order in one tap next time, no app store needed.
          </p>
        </div>
        <button
          onClick={install}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" /> Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Not now"
          className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showIosHelp && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <Share className="mt-0.5 h-4 w-4 shrink-0" />
          In Safari, tap the Share button, then{" "}
          <strong>Add to Home Screen</strong>.
        </p>
      )}
    </div>
  );
};

export default InstallApp;
