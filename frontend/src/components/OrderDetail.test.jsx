import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OrderDetail from "./OrderDetail";

const mockGet = vi.hoisted(() => vi.fn());

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

describe("OrderDetail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("does not render when orderId is not provided", () => {
    render(
      <OrderDetail
        orderId={null}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText("Order Details")).not.toBeInTheDocument();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("fetches and displays order details", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        id: 123,
        created_at: "2026-07-22T10:00:00Z",
        status: "Delivered",
        tax_amount: "10.00",
        grand_total: "110.00",
        address: "123 Test Street",
        city: "Lagos",
        state: "Lagos",
        zip_code: "100001",
        phone_number: "08012345678",
      },
    });

    render(
      <OrderDetail
        orderId={123}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/orders/123");
    });

    expect(await screen.findByText("Order Details")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
    expect(screen.getByText("$110.00")).toBeInTheDocument();
    expect(screen.getByText(/123 Test Street/)).toBeInTheDocument();
    expect(screen.getByText(/Lagos/)).toBeInTheDocument();
    expect(screen.getByText("08012345678")).toBeInTheDocument();
  });

  it("handles API errors without crashing", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockGet.mockRejectedValueOnce(new Error("API request failed"));

    render(
      <OrderDetail
        orderId={123}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/orders/123");
    });

    expect(screen.queryByText("Order Details")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});