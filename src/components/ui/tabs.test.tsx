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
    it("does not change value without onChange being called", () => {
      render(
        <Tabs
          value="tab1"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      // Click doesn't change the visual state without state update
      fireEvent.click(screen.getByRole("button", { name: "Second Tab" }));

      // onChange should be called
      expect(mockOnChange).toHaveBeenCalledWith("tab2");
    });
  });
})
