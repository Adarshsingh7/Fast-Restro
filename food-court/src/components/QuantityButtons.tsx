/** @format */
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import {
  incrementLine,
  removeItemFromCart,
  totalAddedQuantity,
} from "../slice/cartSlice.ts";
import { useMenu } from "../features/menuFeatures/useMenu.ts";

interface QuantityButtonProps {
  quantity: number;
  /** The dish, used for the stock check. */
  itemId: number;
  /** The cart line being changed: one dish may be in the cart more than once
   * with different choices. */
  lineId: string;
}

const QuantityButton: FC<QuantityButtonProps> = function ({
  quantity,
  itemId,
  lineId,
}) {
  const { data } = useMenu();
  const dispatch: AppDispatch = useDispatch();
  const currentProductCount = useSelector(totalAddedQuantity(itemId));
  const menuItemQuantity =
    data?.find((item) => item.itemId === itemId)?.stock || 0;
  const inStock = menuItemQuantity - currentProductCount;

  function handleQuantityChange(amount: number) {
    if (amount === 1) dispatch(incrementLine(lineId));
    if (amount === -1) dispatch(removeItemFromCart(lineId));
  }

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
        <button
          onClick={() => handleQuantityChange(-1)}
          className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          <span className="text-sm font-bold">-</span>
        </button>

        <span className="w-7 text-center text-sm font-medium bg-transparent outline-none">
          {quantity}
        </span>

        <button
          onClick={() => handleQuantityChange(1)}
          className={`w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 ${
            !inStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!inStock}
        >
          <span className="text-sm font-bold">+</span>
        </button>
      </div>
    </div>
  );
};

export default QuantityButton;
