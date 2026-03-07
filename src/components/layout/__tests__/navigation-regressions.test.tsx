import { render, screen } from "@testing-library/react";
import type { HTMLAttributes } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { GlassmorphicHeader } from "@/components/layout/GlassmorphicHeader";
import { FloatingFooter } from "@/components/layout/FloatingFooter";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { publicNavigation } from "@/config/navigation";

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  useInView: () => true,
}));

vi.mock("@/components/layout/Logo", () => ({
  Logo: () => <div>Logo</div>,
}));

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

vi.mock("@/components/CursorToggle", () => ({
  CursorToggle: () => <button type="button">Cursor</button>,
}));

vi.mock("@/components/AccessibilitySettings", () => ({
  AccessibilitySettings: () => <button type="button">Accessibility</button>,
}));

vi.mock("@/components/LanguageSelector", () => ({
  LanguageSelector: () => <button type="button">Language</button>,
}));

vi.mock("@/components/navigation/NavigationSearch", () => ({
  NavigationSearch: () => <button type="button">Search</button>,
}));

vi.mock("@/components/WantToLearnMoreLink", () => ({
  WantToLearnMoreLink: () => (
    <a href="https://example.com">Want to learn more?</a>
  ),
}));

vi.mock("@/components/navigation/MobileMenu", () => ({
  MobileMenu: () => <div>Mobile Menu</div>,
}));

vi.mock("@/lib/mixpanel", () => ({
  trackEvent: vi.fn(),
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <NavigationProvider>
        <GlassmorphicHeader />
      </NavigationProvider>
    </MemoryRouter>,
  );
}

describe("navigation regressions", () => {
  it("shows every public navigation item in the desktop header", () => {
    renderHeader();

    publicNavigation.forEach((item) => {
      expect(
        screen.getByRole("link", {
          name: new RegExp(`^${item.label}$`, "i"),
        }),
      ).toBeInTheDocument();
    });
  });

  it("does not render a stale Brand Kit link in the floating footer", () => {
    render(
      <MemoryRouter>
        <FloatingFooter />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("link", { name: /brand kit/i }),
    ).not.toBeInTheDocument();
  });
});
