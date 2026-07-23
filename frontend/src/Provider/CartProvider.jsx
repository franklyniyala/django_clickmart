import { useMemo, useReducer } from "react";
import CartContext from "../context/CartContext";

const cartReducer = (state, action) => {
  switch (action?.type) {
    case "START_LOADING":
      return { ...state, loading: true };
    case "SET_CART":
      return {
        ...state,
        items: action?.payload?.items,
        subtotal: action?.payload?.subtotal,
        total: action?.payload?.total,
        itemCount: action?.payload?.itemCount,
        loading: false,
      };
    case "STOP_LOADING":
      return { ...state, loading: false };
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    loading: false,
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
export default CartProvider;
