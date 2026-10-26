import { FC, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Check, X } from "lucide-react";
import { AppDispatch } from "../store";
import { addItemToCart, unitPriceOf } from "../slice/cartSlice";
import { MenuItem, OptionGroup } from "../types/menuType";
import { SelectedOption } from "../types/cartType";

const money = (amount: number) => `₹${amount.toFixed(2)}`;

/** The choices a customer starts with: the first free choice of each
 * required pick-one group, so adding is one tap when they want the default. */
const defaultSelection = (groups: OptionGroup[]): SelectedOption[] =>
  groups
    .filter((g) => g.type === "single" && g.required && g.choices.length)
    .map((g) => {
      const choice =
        [...g.choices].sort((a, b) => a.price - b.price)[0] ?? g.choices[0];
      return { group: g.name, choice: choice.name, price: choice.price || 0 };
    });

/**
 * Sheet for picking size, toppings and anything else before adding to the
 * cart. It opens from the dish card and shows the running price.
 */
const OptionPicker: FC<{ item: MenuItem; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const groups = useMemo(() => item.optionGroups ?? [], [item.optionGroups]);
  const [selected, setSelected] = useState<SelectedOption[]>(() =>
    defaultSelection(groups),
  );

  const isPicked = (group: string, choice: string) =>
    selected.some((s) => s.group === group && s.choice === choice);

  const toggle = (group: OptionGroup, choiceName: string, price: number) => {
    setSelected((current) => {
      const picked = isPicked(group.name, choiceName);
      if (group.type === "single") {
        // One choice at a time: replace whatever was picked in this group.
        const others = current.filter((s) => s.group !== group.name);
        return picked && !group.required
          ? others
          : [...others, { group: group.name, choice: choiceName, price }];
      }
      return picked
        ? current.filter(
            (s) => !(s.group === group.name && s.choice === choiceName),
          )
        : [...current, { group: group.name, choice: choiceName, price }];
    });
  };

  const missing = groups.filter(
    (g) => g.required && !selected.some((s) => s.group === g.name),
  );
  const total = unitPriceOf(item, selected);

  const add = () => {
    if (missing.length) return;
    dispatch(addItemToCart(item.itemId, item, selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white">
        <header className="flex items-start gap-3 border-b border-gray-100 p-4">
          {item.image && (
            <img
              src={item.image}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-bold text-gray-900">{item.name}</h2>
            <p className="text-sm text-gray-500">{money(item.price)} base</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {groups.map((group) => (
            <section key={group.name} className="mb-5 last:mb-0">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <span className="text-xs text-gray-500">
                  {group.required ? "Required" : "Optional"} ·{" "}
                  {group.type === "single" ? "pick one" : "pick any"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.choices.map((choice) => {
                  const picked = isPicked(group.name, choice.name);
                  return (
                    <button
                      key={choice.name}
                      onClick={() =>
                        toggle(group, choice.name, choice.price || 0)
                      }
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                        picked
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700"
                      }`}
                    >
                      {picked && <Check className="h-3.5 w-3.5" />}
                      {choice.name}
                      {choice.price > 0 && (
                        <span
                          className={picked ? "text-white/70" : "text-gray-500"}
                        >
                          +{money(choice.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={add}
            disabled={missing.length > 0}
            className="flex w-full items-center justify-between rounded-xl bg-gray-900 px-5 py-3.5 font-semibold text-white disabled:bg-gray-300"
          >
            <span>
              {missing.length ? `Choose ${missing[0].name}` : "Add to cart"}
            </span>
            <span>{money(total)}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default OptionPicker;
