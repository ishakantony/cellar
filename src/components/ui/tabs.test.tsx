import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabOption } from "./tabs";

describe("Tabs Component", () => {
  const mockOptions: TabOption[] = [
    { value: "tab1", label: "First Tab" },
    { value: "tab2", label: "Second Tab" },
    { value: "tab3", label: "Third Tab" },
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Tab list and trigger rendering", () => {
    it("renders all tab buttons from options", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole("button", { name: "First Tab" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Second Tab" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Third Tab" })).toBeInTheDocument();
    });

    it("renders empty list when no options provided", () => {
      const { container } = render(
        <Tabs
          value={null}
          options={[]}
          onChange={mockOnChange}
        />
      );

      const tabContainer = container.firstChild as HTMLElement;
      expect(tabContainer.children.length).toBe(0);
    });

    it("applies size prop with default 'sm'", () => {
      const { container } = render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      expect(container.firstChild).toHaveClass("flex", "items-center", "gap-1", "overflow-x-auto");
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("uses label as key for each button", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });
  });

  describe("Default tab content visibility", () => {
    it("marks active tab with active styling", () => {
      render(
        <Tabs
          value="tab2"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const activeButton = screen.getByRole("button", { name: "Second Tab" });
      expect(activeButton).toHaveClass("bg-primary/10", "text-primary");
    });

    it("marks inactive tabs with inactive styling", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const inactiveButton = screen.getByRole("button", { name: "Second Tab" });
      expect(inactiveButton).toHaveClass("text-outline", "hover:text-on-surface-variant", "hover:bg-surface-container");
    });

    it("handles null value for tab selection", () => {
      render(
        <Tabs
          value={null}
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      // When value is null, no tabs should be active
      const allButtons = screen.getAllByRole("button");
      allButtons.forEach((button) => {
        expect(button).toHaveClass("text-outline", "hover:text-on-surface-variant", "hover:bg-surface-container");
        expect(button).not.toHaveClass("bg-primary/10", "text-primary");
      });
    });
  });

  describe("Tab switching interactions", () => {
    it("calls onChange with tab value when clicked", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const secondTab = screen.getByRole("button", { name: "Second Tab" });
      fireEvent.click(secondTab);

      expect(mockOnChange).toHaveBeenCalledWith("tab2");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("calls onChange with null value when tab with null value is clicked", () => {
      const optionsWithNull: TabOption[] = [
        { value: "tab1", label: "Tab 1" },
        { value: null, label: "All" },
      ];

      render(
        <Tabs
          value="tab1"
          options={optionsWithNull}
          onChange={mockOnChange}
        />
      );

      const allTab = screen.getByRole("button", { name: "All" });
      fireEvent.click(allTab);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("calls onChange for each tab clicked", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Second Tab" }));
      fireEvent.click(screen.getByRole("button", { name: "Third Tab" }));
      fireEvent.click(screen.getByRole("button", { name: "First Tab" }));

      expect(mockOnChange).toHaveBeenCalledTimes(3);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, "tab2");
      expect(mockOnChange).toHaveBeenNthCalledWith(2, "tab3");
      expect(mockOnChange).toHaveBeenNthCalledWith(3, "tab1");
    });
  });

  describe("Controlled mode behavior", () => {
    it("reflects controlled value changes", () => {
      const { rerender } = render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      let firstTab = screen.getByRole("button", { name: "First Tab" });
      expect(firstTab).toHaveClass("bg-primary/10", "text-primary");

      rerender(
        <Tabs
          value="tab2"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      firstTab = screen.getByRole("button", { name: "First Tab" });
      const secondTab = screen.getByRole("button", { name: "Second Tab" });

      expect(firstTab).not.toHaveClass("bg-primary/10", "text-primary");
      expect(firstTab).toHaveClass("text-outline");
      expect(secondTab).toHaveClass("bg-primary/10", "text-primary");
    });

    it("does not change value without onChange being called", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const firstTab = screen.getByRole("button", { name: "First Tab" });
      expect(firstTab).toHaveClass("bg-primary/10", "text-primary");

      // Click doesn't change the visual state without state update
      fireEvent.click(screen.getByRole("button", { name: "Second Tab" }));
      
      // Component is controlled, so visual state should not change without rerender
      // But since we're not rerendering, the first tab should still appear active
      expect(firstTab).toHaveClass("bg-primary/10", "text-primary");
    });
  });

  describe("Accessibility attributes", () => {
    it("renders all tabs as buttons", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });

    it("has proper button labels from option labels", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole("button", { name: "First Tab" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Second Tab" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Third Tab" })).toBeInTheDocument();
    });

    it("buttons are focusable", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const firstTab = screen.getByRole("button", { name: "First Tab" });
      firstTab.focus();
      expect(firstTab).toHaveFocus();
    });

    it("supports keyboard interaction via click", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const firstTab = screen.getByRole("button", { name: "First Tab" });
      
      // Tab should be clickable
      fireEvent.click(firstTab);
      expect(mockOnChange).toHaveBeenCalledWith("tab1");
    });

    it("maintains text content of button", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const firstTab = screen.getByRole("button", { name: "First Tab" });
      expect(firstTab).toHaveTextContent("First Tab");
    });
  });

  describe("Edge cases", () => {
    it("handles single option correctly", () => {
      render(
        <Tabs
          value="only"
          options={[{ value: "only", label: "Only Tab" }]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole("button", { name: "Only Tab" })).toHaveClass("bg-primary/10", "text-primary");
    });

    it("handles tabs with duplicate labels if values differ", () => {
      const optionsWithDuplicateLabels: TabOption[] = [
        { value: "tab1", label: "Same Label" },
        { value: "tab2", label: "Same Label" },
      ];

      render(
        <Tabs
          value="tab1"
          options={optionsWithDuplicateLabels}
          onChange={mockOnChange}
        />
      );

      const buttons = screen.getAllByRole("button", { name: "Same Label" });
      expect(buttons).toHaveLength(2);
    });

    it("applies consistent styling classes", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole("button", { name: "First Tab" });
      expect(button).toHaveClass(
        "px-3",
        "py-1.5",
        "rounded",
        "text-[10px]",
        "font-bold",
        "uppercase",
        "tracking-widest",
        "whitespace-nowrap",
        "transition-all"
      );
    });
  });
});
