interface Variant {
  name: string;
  price: number;
  stock: number;
  _id: {
    $oid: string;
  };
}

interface OptionChoice {
  name: string;
  price: number;
  _id?: string;
}

/** A set of choices the customer makes, such as Size or Toppings. */
interface OptionGroup {
  name: string;
  /** "single" = pick one (size); "multiple" = pick any (toppings). */
  type: "single" | "multiple";
  required: boolean;
  choices: OptionChoice[];
  _id?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  itemId: number;
  description: string;
  price: number;
  category: string;
  availability: boolean;
  variants: Variant[];
  optionGroups?: OptionGroup[];
  image: string;
  ingredients: string[];
  isSpecial: boolean;
  preparationTime: number;
  discount: number;
  stock: number;
  isAvailable: boolean;
  owner: string;
  file?: File | null;
  createdAt: {
    $date: string;
  };
  modifiedAt: {
    $date: string;
  };
  __v: number;
}

export type { MenuItem, OptionGroup, OptionChoice };
