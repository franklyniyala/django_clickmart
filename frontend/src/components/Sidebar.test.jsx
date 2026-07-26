import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Sidebar from "./Sidebar";

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockSetAuth = vi.fn();

vi.mock("react-router-dom", () => ({
  NavLink: ({ children, to }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => ({
    dispatch: mockDispatch,
  }),
}));

vi.mock("../hooks/useAuth", () => ({
  default: () => ({
    setAuth: mockSetAuth,
  }),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders dashboard and orders navigation links", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /my orders/i })).toBeInTheDocument();
  });

  it("logs the user out when Logout is clicked", () => {
    localStorage.setItem("accessToken", "test-access-token");
    localStorage.setItem("refreshToken", "test-refresh-token");

    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();

    expect(mockSetAuth).toHaveBeenCalledWith({});

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_CART",
      payload: {
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
      },
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});