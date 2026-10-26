/** @format */

import { Outlet, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CookingPot, LogOut, Package, UserRound } from "lucide-react";
import { WrapperDelete } from "@/components/WrapperDelete";
import NewOrderPopup from "@/components/NewOrderPopup";
import { useHandleLogout, useIsAuthenticated } from "@/features/authHooks";
import { useOrders } from "@/features/order/useOrder";
import { useSocketStatus } from "@/features/order/useOrderSocket";

type AuthUser = { restroName?: string; username?: string } | null;

const tabs = [
  { to: "order", label: "Orders", Icon: CookingPot },
  { to: "inventory", label: "Inventory", Icon: Package },
  { to: "account", label: "Account", Icon: UserRound },
];

// Mobile-first shell: slim top bar, content, fixed bottom navigation.
export default function DashboardLayout() {
  useIsAuthenticated();
  const { data: user } = useQuery<AuthUser>({ queryKey: ["user"] });
  const { orders } = useOrders();
  const connected = useSocketStatus();
  const logout = useHandleLogout();
  const newCount = orders?.filter((o) => o.status === "new").length ?? 0;

  return (
    <div className="min-h-screen bg-zinc-100">
      <WrapperDelete />
      <NewOrderPopup />

      <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-zinc-50 shadow-sm">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-zinc-900">
              {user?.restroName ?? "My Restaurant"}
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-zinc-400"
                }`}
              />
              {connected ? "Live" : "Reconnecting…"}
            </p>
          </div>
          <button
            onClick={() => logout.logout()}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 px-4 pt-4 pb-24">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-lg grid-cols-3">
          {tabs.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                    isActive ? "text-zinc-900" : "text-zinc-400"
                  }`
                }
              >
                <span className="relative">
                  <Icon className="h-6 w-6" />
                  {to === "order" && newCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-5 rounded-full bg-red-500 px-1 text-center text-[11px] font-bold leading-5 text-white">
                      {newCount}
                    </span>
                  )}
                </span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
