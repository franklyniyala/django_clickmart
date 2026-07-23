import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import AuthProvider from "./AuthProvider";
import { AuthContext } from "../context";

const TestComponent = () => {
  return (
    <AuthContext.Consumer>
      {({ auth }) => (
        <div>
          <span data-testid="access-token">{auth.accessToken || "no-access-token"}</span>
          <span data-testid="refresh-token">{auth.refreshToken || "no-refresh-token"}</span>
        </div>
      )}
    </AuthContext.Consumer>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides empty authentication tokens when localStorage is empty", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("access-token")).toHaveTextContent(
      "no-access-token"
    );
    expect(screen.getByTestId("refresh-token")).toHaveTextContent(
      "no-refresh-token"
    );
  });

  it("loads authentication tokens from localStorage", () => {
    localStorage.setItem("accessToken", "test-access-token");
    localStorage.setItem("refreshToken", "test-refresh-token");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("access-token")).toHaveTextContent(
      "test-access-token"
    );
    expect(screen.getByTestId("refresh-token")).toHaveTextContent(
      "test-refresh-token"
    );
  });
});