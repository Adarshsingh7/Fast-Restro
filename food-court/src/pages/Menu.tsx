import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Search, Store, X } from "lucide-react";
import ProductList from "../components/ProductList";
import NoData from "../ui/NoData";
import PageNotFound from "./PageNotFound";
import ErrorPage from "./ErrorPage";
import BackdropLoader from "../components/BackdropLoader";
import LocalStorageHandler from "../utils/LocalStorageHandler";
import { useMenusByOwner } from "../features/menuFeatures/useMenusByOwner";
import { useRestro } from "../features/restro/useRestro";
import { MenuItem } from "../types/menuType";
import InstallApp from "../components/InstallApp";
import { applyRestroManifest } from "../lib/manifest";

const ALL = "all";

// Name, address and logo of the restaurant whose menu this is.
const RestroHeader: FC<{ restroId: string }> = ({ restroId }) => {
  const { restro } = useRestro(restroId);

  // Name the installable app after this restaurant.
  useEffect(() => {
    if (restro) applyRestroManifest(restro);
  }, [restro]);

  return (
    <header className="flex items-center gap-3 px-4 pt-5 pb-4">
      {restro?.restroLogo ? (
        <img
          src={restro.restroLogo}
          alt=""
          className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-gray-200"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 ring-1 ring-gray-200">
          <Store className="h-6 w-6" />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-gray-900">
          {restro?.restroName ?? "Menu"}
        </h1>
        {restro?.restroAddress && (
          <p className="flex items-start gap-1 truncate text-sm text-gray-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {restro.restroAddress}
          </p>
        )}
      </div>
    </header>
  );
};

// One tap switches section. Categories come from the menu itself, so a
// restaurant's own category names appear here automatically.
const CategoryBar: FC<{
  categories: string[];
  active: string;
  counts: Record<string, number>;
  onPick: (category: string) => void;
}> = ({ categories, active, counts, onPick }) => (
  <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
    <div className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {[ALL, ...categories].map((category) => (
        <button
          key={category}
          onClick={() => onPick(category)}
          className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
            active === category
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {category === ALL ? "All" : category}
          <span
            className={`ml-1.5 text-xs ${
              active === category ? "text-white/60" : "text-gray-400"
            }`}
          >
            {counts[category]}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default function MenuList() {
  const { restroId } = useParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);

  const { menus, isLoading } = useMenusByOwner(restroId);
  const { restro } = useRestro(restroId);
  const restroName = restro?.restroName;

  const categories = useMemo(
    () => [...new Set((menus ?? []).map((m) => m.category).filter(Boolean))].sort(),
    [menus],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { [ALL]: menus?.length ?? 0 };
    (menus ?? []).forEach((m) => {
      result[m.category] = (result[m.category] ?? 0) + 1;
    });
    return result;
  }, [menus]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (menus ?? []).filter((item: MenuItem) => {
      const inCategory = category === ALL || item.category === category;
      const matches =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [menus, category, search]);

  if (!restroId) return <PageNotFound />;

  // Remembered so an order page opened later knows which menu it belongs to.
  LocalStorageHandler.set("restroId", restroId);

  if (isLoading) return <BackdropLoader />;
  if (!menus) return <ErrorPage message="Could not load this menu" />;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-white" id="menu">
      <RestroHeader restroId={restroId} />

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            placeholder="Search the menu"
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm outline-none focus:border-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <InstallApp restroName={restroName} />

      {categories.length > 1 && (
        <CategoryBar
          categories={categories}
          active={category}
          counts={counts}
          onPick={setCategory}
        />
      )}

      <div className="px-4 py-4">
        {visible.length ? (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((item) => (
              <ProductList item={item} key={item.itemId} />
            ))}
          </div>
        ) : (
          <NoData message="Nothing matches that" />
        )}
      </div>
    </div>
  );
}
