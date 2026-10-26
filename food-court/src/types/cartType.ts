import { MenuItem } from "./menuType";

// this is the type for each of the item or product displayed in the system
export interface itemType {
  name: string;
  image: string;
  id: number;
  unit:
    | "piece"
    | "plate"
    | "kg"
    | "litre"
    | "dozen"
    | "pack"
    | "box"
    | "bottle"
    | "can"
    | "bag"
    | "sachet";
  description: string;
  price: number;
  productType: "food" | "vegetable" | "fruit";
  tags: string[];
  quantity: number;
  discount?: number;
}

/** One choice the customer made, kept as text for the order and receipt. */
export interface SelectedOption {
  group: string;
  choice: string;
  price: number;
}

export interface CartItemType {
  item: MenuItem;
  itemId: number;
  /**
   * Identifies this line. The same dish ordered with different choices is a
   * separate line, so this is the item id plus the choices made.
   */
  lineId: string;
  quantity: number;
  selectedOptions: SelectedOption[];
  /** Base price plus the chosen extras, for one unit. */
  unitPrice: number;
}

export interface CartType {
  items: CartItemType[];
  amount: number;
}

export interface OrderItem {
  price: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface Order {
  id: number | string;
  address: string;
  phone: number;
  status: string;
  customerName: string;
  orderItem: OrderItem[];
}
