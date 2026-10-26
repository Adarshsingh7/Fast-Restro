import { FC, useEffect, useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Chrome fires this before showing its own install UI; keeping the event lets
// the page offer installing at a moment that makes sense.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !/crios|fxios/i.test(navigator.userAgent);

/** Lets the owner keep the dashboard on their home screen like an app. */
const InstallApp: FC = () => {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!prompt && !isIos())) return null;

  const install = async () => {
    if (!prompt) return setShowIosHelp(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null);
    if (outcome === "accepted") setInstalled(true);
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-zinc-900">
        <Smartphone className="h-4 w-4" /> Keep this on your home screen
      </h3>
      <p className="mt-0.5 text-sm text-zinc-500">
        Opens full screen like an app, and new orders still alert you.
      </p>
      <Button variant="outline" className="mt-3 h-11 w-full" onClick={install}>
        <Download /> Install dashboard
      </Button>
      {showIosHelp && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
          <Share className="mt-0.5 h-4 w-4 shrink-0" />
          In Safari, tap the Share button, then <strong>Add to Home Screen</strong>.
        </p>
      )}
    </section>
  );
};

export default InstallApp;
