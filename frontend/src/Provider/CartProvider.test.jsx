import { act, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CartProvider from "./CartProvider";
import CartContext from "../context/CartContext";

const TestComponent = () => {
  return (
    <CartContext.Consumer>
      {({ state }) => (
        <div>
          <span data-testid="item-count">{state.itemCount}</span>
          <span data-testid="total">{state.total}</span>
          <span data-testid="loading">{state.loading.toString()}</span>
        </div>
      )}
    </CartContext.Consumer>
  );
};

const TestDispatchComponent = () => {
  return (
    <CartContext.Consumer>
      {({ state, dispatch }) => (
        <div>
          <button
            onClick={() =>
              dispatch({
                type: "SET_CART",
                payload: {
                  items: [{ id: 1 }],
                  subtotal: 100,
                  total: 110,
                  itemCount: 1,
                },
              })
            }
          >
            Update Cart
          </button>

          <span data-testid="item-count">{state.itemCount}</span>
          <span data-testid="subtotal">{state.subtotal}</span>
          <span data-testid="total">{state.total}</span>
          <span data-testid="loading">{state.loading.toString()}</span>
        </div>
      )}
    </CartContext.Consumer>
  );
};

describe("CartProvider", () => {
  it("provides the default cart state", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("item-count")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("updates cart state when SET_CART is dispatched", async () => {
    render(
      <CartProvider>
        <TestDispatchComponent />
      </CartProvider>
    );

    await act(async () => {
      screen.getByRole("button", { name: "Update Cart" }).click();
    });

    expect(screen.getByTestId("item-count")).toHaveTextContent("1");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("100");
    expect(screen.getByTestId("total")).toHaveTextContent("110");
  });
});