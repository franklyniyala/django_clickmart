import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Orders from "./Orders";

const mockGet = vi.fn();

vi.mock("../hooks/useAxios", () => ({
  useAxios: () => ({
    api: {
      get: mockGet,
    },
  }),
}));

vi.mock("../hooks/useAuth", () => ({
  default: () => ({
    auth: {
      accessToken: "test-access-token",
    },
  }),
}));

vi.mock("../components/OrderDetail", () => ({
  default: ({ orderId, isOpen }) =>
    isOpen ? (
      <div data-testid="order-detail">
        Order Detail for {orderId}
      </div>
    ) : null,
}));

vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-circle" />,
  CheckCircle: () => <span data-testid="check-circle" />,
  Clock: () => <span data-testid="clock" />,
  Eye: () => <span data-testid="eye" />,
  Package: () => <span data-testid="package" />,
}));

describe("Orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state while fetching orders", () => {
    mockGet.mockImplementation(
      () => new Promise(() => {})
    );

    render(<Orders />);

    expect(
      document.querySelector(".spinner-border")
    ).toBeInTheDocument();
  });

  it("renders no orders message when order list is empty", async () => {
    mockGet.mockResolvedValueOnce({
      data: [],
    });

    render(<Orders />);

    expect(
      await screen.findByText("No orders found in your account.")
    ).toBeInTheDocument();
  });

  it("renders orders returned by the API", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 123,
          created_at: "2026-07-22T10:00:00Z",
          status: "DELIVERED",
          grand_total: "110.00",
          tax_amount: "10.00",
        },
      ],
    });

    render(<Orders />);

    expect(
      await screen.findByText("#123")
    ).toBeInTheDocument();

    expect(
      screen.getByText("DELIVERED")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$110.00")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$10.00")
    ).toBeInTheDocument();
  });

  it("opens order details when Details button is clicked", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 123,
          created_at: "2026-07-22T10:00:00Z",
          status: "DELIVERED",
          grand_total: "110.00",
          tax_amount: "10.00",
        },
      ],
    });

    render(<Orders />);

    const detailsButton = await screen.findByRole(
      "button",
      {
        name: /details/i,
      }
    );

    fireEvent.click(detailsButton);

    expect(
      await screen.findByTestId("order-detail")
    ).toHaveTextContent(
      "Order Detail for 123"
    );
  });

  it("handles API errors without crashing", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockGet.mockRejectedValueOnce(
      new Error("API request failed")
    );

    render(<Orders />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "/orders/"
      );
    });

    consoleErrorSpy.mockRestore();
  });
});