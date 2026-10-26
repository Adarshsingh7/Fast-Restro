import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { AppDispatch, RootState } from "../store.ts";
import { addItemToCart, totalAddedQuantity } from "../slice/cartSlice.ts";
import QuantityButton from "./QuantityButtons.tsx";
import OptionPicker from "./OptionPicker.tsx";
import { MenuItem } from "../types/menuType.ts";

interface ProductListProps {
  item: MenuItem;
}

const ProductList: FC<ProductListProps> = function ({ item }) {
  const dispatch: AppDispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const inCart = useSelector(totalAddedQuantity(item.itemId));
  const [picking, setPicking] = useState(false);

  // A dish with choices can be in the cart several times; its card adds a new
  // line rather than changing an existing one.
  const hasOptions = (item.optionGroups?.length ?? 0) > 0;
  const line = cartItems.find((c) => c.itemId === item.itemId);

  const totalItemQuantity = item.stock - inCart;
  const badgeContent =
    totalItemQuantity > 10
      ? ""
      : totalItemQuantity > 5
        ? "FEW LEFT"
        : totalItemQuantity === 0
          ? "OUT OF STOCK"
          : `${totalItemQuantity} LEFT`;

  const badgeColor =
    totalItemQuantity > 10 ? "default" : totalItemQuantity > 5 ? "warning" : "error";

  const addDirectly = () => dispatch(addItemToCart(item.itemId, item, []));

  return (
    <>
      <Badge
        badgeContent={badgeContent}
        color={badgeColor}
        sx={{
          width: "100%",
          "& .MuiBadge-badge": {
            fontSize: { xs: "0.65rem", sm: "0.75rem" },
            fontWeight: "bold",
            padding: { xs: "0 4px", sm: "0 8px" },
          },
        }}
      >
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden">
            <LazyLoadImage
              className="absolute inset-0 w-full h-full object-cover"
              src={item.image}
              effect="opacity"
              placeholderSrc={item.name}
              alt={item.name}
            />
          </div>

          <div className="p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-1">
              {item.name}
            </h3>

            <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2">
              {item.description}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                ₹{item.price}
                {hasOptions && (
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    onwards
                  </span>
                )}
              </p>

              {hasOptions ? (
                <button
                  onClick={() => setPicking(true)}
                  disabled={totalItemQuantity <= 0}
                  className="relative px-3 py-1.5 text-xs font-medium text-white bg-[#8BC34A] rounded-full hover:bg-green-700 disabled:opacity-50"
                >
                  Choose
                  {inCart > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-gray-900 px-1 text-[10px] leading-4">
                      {inCart}
                    </span>
                  )}
                </button>
              ) : line ? (
                <QuantityButton
                  quantity={line.quantity}
                  itemId={item.itemId}
                  lineId={line.lineId}
                />
              ) : (
                <button
                  onClick={addDirectly}
                  disabled={totalItemQuantity <= 0}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-[#8BC34A] rounded-full hover:bg-green-700 disabled:opacity-50"
                >
                  Add to cart
                </button>
              )}
            </div>
          </div>
        </div>
      </Badge>

      {picking && (
        <OptionPicker item={item} onClose={() => setPicking(false)} />
      )}
    </>
  );
};

export default ProductList;
