// The app ships with a generic manifest. When a customer opens a particular
// restaurant's menu we swap in one named after that restaurant, so the
// installed icon says "Spice Garden" rather than "Food Court" and opens
// straight at that menu.
import { PublicRestro } from "../features/restro/useRestro";

let objectUrl: string | null = null;

export const applyRestroManifest = (restro: PublicRestro) => {
  const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link || !restro.restroName) return;

  const name = restro.restroName;
  const manifest = {
    name: `${name} — Order Food`,
    short_name: name.slice(0, 12),
    description: `Browse the menu and order from ${name}.`,
    start_url: `/menu/${restro._id}`,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#178c2e",
    icons: [
      { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/pwa-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  try {
    const next = URL.createObjectURL(
      new Blob([JSON.stringify(manifest)], {
        type: "application/manifest+json",
      }),
    );
    link.href = next;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = next;
  } catch {
    // Keep the generic manifest if the browser refuses a generated one.
  }
};
