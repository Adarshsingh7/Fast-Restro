import { FC } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionGroup } from "@/types/menuType";

// Starting points so a group can be added in one tap and renamed after.
const PRESETS: { label: string; group: OptionGroup }[] = [
  {
    label: "Size",
    group: {
      name: "Size",
      type: "single",
      required: true,
      choices: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 50 },
      ],
    },
  },
  {
    label: "Toppings",
    group: {
      name: "Toppings",
      type: "multiple",
      required: false,
      choices: [
        { name: "Extra cheese", price: 30 },
        { name: "Extra sauce", price: 15 },
      ],
    },
  },
  {
    label: "Blank group",
    group: {
      name: "",
      type: "single",
      required: false,
      choices: [{ name: "", price: 0 }],
    },
  },
];

/**
 * Edits the choices a customer makes for an item: a "Size" group where one
 * choice is required, a "Toppings" group where several may be picked, or
 * anything else the restaurant names itself.
 */
const OptionGroupEditor: FC<{
  groups: OptionGroup[];
  onChange: (groups: OptionGroup[]) => void;
}> = ({ groups, onChange }) => {
  const update = (index: number, patch: Partial<OptionGroup>) =>
    onChange(groups.map((g, i) => (i === index ? { ...g, ...patch } : g)));

  const updateChoice = (
    gi: number,
    ci: number,
    patch: Partial<OptionGroup["choices"][number]>,
  ) =>
    update(gi, {
      choices: groups[gi].choices.map((c, i) =>
        i === ci ? { ...c, ...patch } : c,
      ),
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-700">
          Choices for the customer
        </span>
        {groups.length > 0 && (
          <span className="text-xs text-zinc-500">
            {groups.length} group{groups.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {groups.map((group, gi) => (
        <div
          key={gi}
          className="rounded-lg border border-zinc-200 bg-zinc-50/70 p-3"
        >
          <div className="flex items-center gap-2">
            <Input
              value={group.name}
              onChange={(e) => update(gi, { name: e.target.value })}
              placeholder="Group name, e.g. Size"
              className="h-10 bg-white"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 shrink-0 text-red-600 hover:text-red-700"
              aria-label={`Remove ${group.name || "group"}`}
              onClick={() => onChange(groups.filter((_, i) => i !== gi))}
            >
              <Trash2 />
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {/* One tap switches between pick-one and pick-many. */}
            <div className="flex rounded-md bg-zinc-200/70 p-0.5">
              {(["single", "multiple"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update(gi, { type })}
                  className={`rounded px-2.5 py-1 font-medium ${
                    group.type === type
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-600"
                  }`}
                >
                  {type === "single" ? "Pick one" : "Pick any"}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-zinc-600">
              <input
                type="checkbox"
                checked={group.required}
                onChange={(e) => update(gi, { required: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Must choose
            </label>
          </div>

          <ul className="mt-2 space-y-2">
            {group.choices.map((choice, ci) => (
              <li key={ci} className="flex items-center gap-2">
                <Input
                  value={choice.name}
                  onChange={(e) =>
                    updateChoice(gi, ci, { name: e.target.value })
                  }
                  placeholder="Choice, e.g. Large"
                  className="h-10 flex-1 bg-white"
                />
                <div className="relative w-24 shrink-0">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    +₹
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={choice.price}
                    onChange={(e) =>
                      updateChoice(gi, ci, { price: Number(e.target.value) })
                    }
                    className="h-10 bg-white pl-7"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-10 w-9 shrink-0 text-zinc-400 hover:text-red-600"
                  aria-label={`Remove ${choice.name || "choice"}`}
                  onClick={() =>
                    update(gi, {
                      choices: group.choices.filter((_, i) => i !== ci),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant="outline"
            className="mt-2 h-10 w-full bg-white"
            onClick={() =>
              update(gi, { choices: [...group.choices, { name: "", price: 0 }] })
            }
          >
            <Plus /> Add choice
          </Button>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {PRESETS.filter(
          (p) => !groups.some((g) => g.name && g.name === p.group.name),
        ).map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() =>
              onChange([
                ...groups,
                { ...preset.group, choices: [...preset.group.choices] },
              ])
            }
          >
            <Plus /> {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default OptionGroupEditor;
