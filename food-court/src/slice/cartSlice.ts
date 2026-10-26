/** @format */

import { createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { CartType, CartItemType, SelectedOption } from "../types/cartType";
import { RootState } from "../store.ts";
import { MenuItem } from "../types/menuType.ts";
import toast from "react-hot-toast";

const initialState: CartType = {
  items: [],
  amount: 0,
};

/** The same dish with different choices is a separate line in the cart. */
export const buildLineId = (
  itemId: number,
  selectedOptions: SelectedOption[] = [],
) =>
  [
    itemId,
    ...selectedOptions
      .map((o) => `${o.group}:${o.choice}`)
      .sort((a, b) => a.localeCompare(b)),
  ].join("|");

export const unitPriceOf = (
  item: MenuItem,
  selectedOptions: SelectedOption[] = [],
) => item.price + selectedOptions.reduce((sum, o) => sum + (o.price || 0), 0);

const recalculate = (state: CartType) => {
  state.amount = state.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    emptyCart: (state) => {
      state.items = [];
      state.amount = 0;
    },
    addItem: (state, action: PayloadAction<CartItemType>) => {
      state.items.push(action.payload);
      recalculate(state);
      toast.success("Item added to cart");
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.lineId !== action.payload);
      recalculate(state);
      toast.error("Item removed from cart");
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.lineId === action.payload);
      if (item) {
        item.quantity += 1;
        recalculate(state);
        toast.success("Item added to cart");
      }
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.lineId === action.payload);
      if (item) {
        item.quantity -= 1;
        recalculate(state);
      }
    },
  },
});

/**
 * Adds one of a dish to the cart. Passing the customer's choices keeps each
 * combination on its own line.
 */
export const addItemToCart = (
  itemId: number,
  product: MenuItem,
  selectedOptions: SelectedOption[] = [],
): ThunkAction<
  void,
  RootState,
  unknown,
  PayloadAction<CartItemType | string>
> => {
  return (dispatch, getState) => {
    const lineId = buildLineId(itemId, selectedOptions);
    const { cart } = getState();
    const existing = cart.items.find((item) => item.lineId === lineId);

    if (existing) {
      dispatch(cartSlice.actions.incrementQuantity(lineId));
    } else if (product) {
      dispatch(
        cartSlice.actions.addItem({
          item: product,
          itemId,
          lineId,
          quantity: 1,
          selectedOptions,
          unitPrice: unitPriceOf(product, selectedOptions),
        }),
      );
    }
  };
};

/** Adds one more of a line already in the cart, keeping its choices. */
export const incrementLine = (
  lineId: string,
): ThunkAction<void, RootState, unknown, PayloadAction<string>> => {
  return (dispatch) => dispatch(cartSlice.actions.incrementQuantity(lineId));
};

export const removeItemFromCart = (
  lineId: string,
): ThunkAction<void, RootState, unknown, PayloadAction<string>> => {
  return function (dispatch, getState) {
    const { cart } = getState();
    const existing = cart.items.find((item) => item.lineId === lineId);
    if (existing && existing.quantity > 1) {
      dispatch(cartSlice.actions.decrementQuantity(lineId));
    } else {
      dispatch(cartSlice.actions.removeItem(lineId));
    }
  };
};

/** How many of a dish are in the cart, across every combination of choices. */
export const totalAddedQuantity = (itemId: number) => (store: RootState) =>
  store.cart.items
    .filter((item) => item.itemId === itemId)
    .reduce((sum, item) => sum + item.quantity, 0);

/** The quantity on one cart line. */
export const lineQuantity = (lineId: string) => (store: RootState) =>
  store.cart.items.find((item) => item.lineId === lineId)?.quantity ?? 0;

export const { removeItem, emptyCart } = cartSlice.actions;

export default cartSlice.reducer;
