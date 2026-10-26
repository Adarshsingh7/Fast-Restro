import { FC } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ClipboardList, CookingPot, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { RootState } from "../store";
import { useOngoingOrders } from "../features/order/useOngoingOrders";
import LocalStorageHandler from "../utils/LocalStorageHandler";
import FloatingCart from "./FloatingCart";

// Everything that sits at the bottom of the screen, in one stack so the bars
// never overlap: the live order strip, the cart, then the navigation.
const BottomBars: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ongoing } = useOngoingOrders();
  const cart = useSelector((state: RootState) => state.cart.items);

  const restroId =
    location.pathname.match(/^\/menu\/([^/]+)/)?.[1] ??
    LocalStorageHandler.get<string>("restroId") ??
    "";

  const onMenu = /^\/menu\/[^/]+$/.test(location.pathname);
  const onHistory = location.pathname === "/history";
  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const order = ongoing[0];

  const goToCart = () => {
    if (!cartCount) return toast("Your cart is empty");
    navigate(`/menu/${restroId}/order`);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-lg px-3 pb-2">
        {/* Live status of the most recent unfinished order. */}
        {order && (
          <Link
            to={`/order/${order._id}`}
            className="mb-2 flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-2.5 text-white shadow-lg"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
              <CookingPot className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {order.status === "new"
                  ? "Order sent to the kitchen"
                  : "Your order is being prepared"}
              </span>
              <span className="block truncate text-xs text-white/70">
                #{order._id.slice(-6).toUpperCase()} · ₹
                {order.totalAmount.toFixed(2)}
                {ongoing.length > 1 && ` · +${ongoing.length - 1} more`}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold underline">
              Track
            </span>
          </Link>
        )}

        {/* The cart, only where ordering happens. */}
        {onMenu && <FloatingCart />}
      </div>

      <nav className="border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto grid max-w-lg grid-cols-3">
          <li>
            <Link
              to={restroId ? `/menu/${restroId}` : "/"}
              className={`flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                onMenu ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <UtensilsCrossed className="h-5 w-5" />
              Menu
            </Link>
          </li>
          <li>
            <Link
              to="/history"
              className={`relative flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                onHistory ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <span className="relative">
                <ClipboardList className="h-5 w-5" />
                {ongoing.length > 0 && (
                  <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </span>
              My orders
            </Link>
          </li>
          <li>
            <button
              onClick={goToCart}
              className={`flex w-full flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                cartCount ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-gray-900 px-1 text-center text-[10px] font-bold leading-4 text-white">
                    {cartCount}
                  </span>
                )}
              </span>
              Cart
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default BottomBars;
