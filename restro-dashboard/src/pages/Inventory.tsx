import { ChangeEvent, FC, FormEvent, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useDialog } from "@/context/DialogContext";
import {
  useAddProduct,
  useDeleteMenuItem,
  useMenu,
  useUpdateMenuItem,
} from "@/features/menuFeatures/useMenu";
import { menu } from "@/features/menuFeatures/menuFeatures";
import { useItemImage } from "@/features/menuFeatures/useItemImage";
import { formatMoney } from "@/features/order/orderHelpers";
import CenteredLoader from "@/ui/CenteredLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { MenuItem } from "@/types/menuType";

const CATEGORIES = [
  "appetizer",
  "main course",
  "dessert",
  "beverages",
  "snacks",
  "vegetable",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=60";

// Stock taps are saved after a short pause so quick +/+/+ presses send one request.
const useStockStepper = () => {
  const queryClient = useQueryClient();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  return (item: MenuItem, delta: number) => {
    // Read the latest cached stock: fast taps can fire before the list re-renders.
    const current =
      queryClient
        .getQueryData<MenuItem[]>(["menuItem"])
        ?.find((m) => m._id === item._id)?.stock ?? item.stock;
    const stock = Math.max(0, current + delta);
    queryClient.setQueryData<MenuItem[]>(["menuItem"], (old) =>
      old?.map((m) => (m._id === item._id ? { ...m, stock } : m)),
    );
    clearTimeout(timers.current[item._id]);
    timers.current[item._id] = setTimeout(() => {
      menu.updateMenu(item._id, { stock }).catch(() => {
        toast.error(`Could not save stock for ${item.name}`);
        queryClient.invalidateQueries(["menuItem"]);
      });
    }, 600);
  };
};

const Field: FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
    {label}
    {children}
  </label>
);

// Two ways to add a photo: the phone camera, or a file already on the device.
const PhotoPicker: FC<{
  value: string;
  onChange: (url: string) => void;
}> = ({ value, onChange }) => {
  const { uploadItemImage, uploading } = useItemImage();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await uploadItemImage(file);
    if (url) onChange(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">Photo</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          ) : value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-zinc-400" />
          )}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={uploading}
            onClick={() => cameraRef.current?.click()}
          >
            <Camera /> Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={uploading}
            onClick={() => galleryRef.current?.click()}
          >
            <Upload /> Upload
          </Button>
        </div>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

const ItemSheet: FC<{
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  categories: string[];
}> = ({ item, open, onClose, categories }) => {
  const { addProduct, isLoading: adding } = useAddProduct();
  const { updateMenuItem, isLoading: saving } = useUpdateMenuItem();
  const { deleteMenuItem } = useDeleteMenuItem();
  const { openDeleteDialog } = useDialog();
  const [image, setImage] = useState(item?.image ?? "");
  const isEdit = !!item;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const price = Number(f.get("price"));
    const stock = Number(f.get("stock"));
    const data: Partial<MenuItem> = {
      name: String(f.get("name")).trim(),
      price,
      stock,
      category: String(f.get("category")).trim().toLowerCase(),
      preparationTime: Number(f.get("preparationTime")) || 10,
      description: String(f.get("description") ?? "").trim(),
    };
    if (image) data.image = image;

    try {
      if (isEdit) {
        await updateMenuItem({ id: item._id, updatedData: data });
      } else {
        await addProduct({
          data: {
            ...data,
            image: image || FALLBACK_IMAGE,
            // A default variant keeps the item marked available by the API.
            variants: [
              { name: "Regular", price, stock } as MenuItem["variants"][number],
            ],
          },
        });
      }
      onClose();
    } catch {
      // Hooks already show the error toast.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
        <DialogTitle className="text-lg font-bold">
          {isEdit ? "Edit item" : "Add item"}
        </DialogTitle>
        <form
          key={item?._id ?? "new"}
          onSubmit={submit}
          className="flex flex-col gap-3"
        >
          <Field label="Name">
            <Input
              name="name"
              required
              minLength={3}
              defaultValue={item?.name}
              placeholder="e.g. Masala Dosa"
              className="h-11"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)">
              <Input
                name="price"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                required
                defaultValue={item?.price}
                className="h-11"
              />
            </Field>
            <Field label="In stock">
              <Input
                name="stock"
                type="number"
                inputMode="numeric"
                min={0}
                required
                defaultValue={item?.stock ?? 20}
                className="h-11"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              {/* Pick one already in use, or just type a new name. */}
              <Input
                name="category"
                list="category-options"
                required
                defaultValue={item?.category ?? ""}
                placeholder="e.g. main course"
                autoCapitalize="none"
                className="h-11"
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Prep time (min)">
              <Input
                name="preparationTime"
                type="number"
                inputMode="numeric"
                min={1}
                defaultValue={item?.preparationTime ?? 10}
                className="h-11"
              />
            </Field>
          </div>
          <Field label="Description (optional)">
            <textarea
              name="description"
              rows={2}
              defaultValue={item?.description}
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </Field>
          <PhotoPicker value={image} onChange={setImage} />

          <Button
            type="submit"
            className="mt-1 h-12 text-base"
            disabled={adding || saving}
          >
            {isEdit ? "Save changes" : "Add to menu"}
          </Button>
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() =>
                openDeleteDialog(async () => {
                  await deleteMenuItem({ id: item._id });
                  onClose();
                })
              }
            >
              <Trash2 /> Remove from menu
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Inventory: FC = () => {
  const { data: items, isLoading } = useMenu();
  const changeStock = useStockStepper();
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<{ open: boolean; item: MenuItem | null }>(
    { open: false, item: null },
  );

  if (isLoading || !items)
    return (
      <CenteredLoader
        blurIntensity="low"
        fadeIn={true}
        type="dots"
        color="green"
      />
    );

  // Suggestions for the category box: what this menu already uses, plus a few
  // common starters for a new menu.
  const categories = [
    ...new Set([...items.map((i) => i.category), ...CATEGORIES]),
  ]
    .filter(Boolean)
    .sort();

  const q = query.trim().toLowerCase();
  const visible = [...items]
    .filter((i) => !q || i.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  const outOfStock = items.filter((i) => i.stock === 0).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-zinc-900">Inventory</h2>
        <p className="text-sm text-zinc-500">
          {items.length} items
          {outOfStock > 0 && (
            <span className="text-red-600"> · {outOfStock} sold out</span>
          )}
        </p>
      </div>

      {items.length > 6 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find an item"
            className="h-11 bg-white pl-9"
          />
        </div>
      )}

      {visible.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
          <Package className="mb-2 h-7 w-7 text-zinc-400" />
          {items.length ? "No item matches." : "Your menu is empty. Add your first item."}
        </div>
      )}

      {/* Bottom padding keeps the last row clear of the floating "Add item" button. */}
      <ul className="flex flex-col gap-2 pb-16">
        {visible.map((item) => (
          <li
            key={item._id}
            className={`flex items-center gap-3 rounded-xl border bg-white p-2.5 shadow-sm ${
              item.stock === 0 ? "border-red-200" : "border-zinc-200"
            }`}
          >
            <button
              onClick={() => setSheet({ open: true, item })}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <img
                src={item.image}
                alt=""
                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate font-semibold text-zinc-900">
                  {item.name}
                </span>
                <span className="block text-sm text-zinc-500">
                  {formatMoney(item.price)}
                  {item.stock === 0 && (
                    <span className="ml-1.5 font-semibold text-red-600">
                      Sold out
                    </span>
                  )}
                </span>
              </span>
            </button>

            <div className="flex shrink-0 items-center rounded-full bg-zinc-100">
              <button
                onClick={() => changeStock(item, -1)}
                disabled={item.stock === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 active:bg-zinc-200 disabled:opacity-30"
                aria-label={`Decrease stock of ${item.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-bold tabular-nums text-zinc-900">
                {item.stock}
              </span>
              <button
                onClick={() => changeStock(item, 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 active:bg-zinc-200"
                aria-label={`Increase stock of ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setSheet({ open: true, item: null })}
        className="fixed bottom-20 right-[max(1rem,calc(50%-15rem))] z-20 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3.5 font-semibold text-white shadow-lg active:scale-95"
      >
        <Plus className="h-5 w-5" /> Add item
      </button>

      <ItemSheet
        key={sheet.item?._id ?? "new"}
        open={sheet.open}
        item={sheet.item}
        categories={categories}
        onClose={() => setSheet({ open: false, item: null })}
      />
    </div>
  );
};

export default Inventory;
