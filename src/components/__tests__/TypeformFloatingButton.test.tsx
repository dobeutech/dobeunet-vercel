/**
 * TypeformFloatingButton - reproduction test for useCallback import bug
 * Bug: useCallback was used but not imported (ReferenceError at runtime)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeformFloatingButton } from "../TypeformFloatingButton";

vi.mock("@/lib/mixpanel", () => ({ trackEvent: vi.fn() }));

describe("TypeformFloatingButton", () => {
  it("renders without crashing (useCallback import fix)", () => {
    render(<TypeformFloatingButton />);
    expect(screen.getByRole("button", { name: /open contact form/i })).toBeInTheDocument();
  });

  it("opens link in new tab on click", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<TypeformFloatingButton />);
    await userEvent.click(screen.getByRole("button", { name: /open contact form/i }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("dobeu.typeform.com"),
      "_blank",
      "noopener,noreferrer"
    );
    openSpy.mockRestore();
  });
});
