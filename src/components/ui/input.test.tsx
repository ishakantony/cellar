import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  describe("rendering", () => {
    it("renders with default props", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders with custom value", () => {
      render(<Input value="Hello World" onChange={() => {}} />);
      
      const input = screen.getByDisplayValue("Hello World");
      expect(input).toBeInTheDocument();
    });

    it("renders with placeholder", () => {
      render(<Input value="" onChange={() => {}} placeholder="Enter your name" />);
      
      const input = screen.getByPlaceholderText("Enter your name");
      expect(input).toBeInTheDocument();
    });

    it("renders with custom id", () => {
      render(<Input value="" onChange={() => {}} id="username-input" />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "username-input");
    });

    it("renders with custom className", () => {
      render(<Input value="" onChange={() => {}} className="custom-input-class" />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-input-class");
    });
  });

  describe("input types", () => {
    it("renders text type by default", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
    });

    it("renders email type", () => {
      render(<Input type="email" value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
    });

    it("renders url type", () => {
      render(<Input type="url" value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "url");
    });

    it("renders password type", () => {
      render(<Input type="password" value="secret" onChange={() => {}} />);
      
      // Password inputs don't have role="textbox", use querySelector instead
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("change events", () => {
    it("calls onChange when value changes", async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);
      
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "a");
      
      expect(handleChange).toHaveBeenCalledWith("a");
    });

    it("calls onChange with correct value for multiple characters", async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} />);
      
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "hello");
      
      expect(handleChange).toHaveBeenCalledTimes(5);
      expect(handleChange).toHaveBeenLastCalledWith("o");
    });

    it("calls onChange for email input", async () => {
      const handleChange = vi.fn();
      render(<Input type="email" value="" onChange={handleChange} />);
      
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test@example.com");
      
      expect(handleChange).toHaveBeenCalledTimes(16);
    });

    it("calls onChange for password input", async () => {
      const handleChange = vi.fn();
      render(<Input type="password" value="" onChange={handleChange} />);
      
      const input = document.querySelector('input[type="password"]')!;
      await userEvent.type(input, "secret123");
      
      expect(handleChange).toHaveBeenCalledTimes(9);
    });
  });

  describe("disabled state", () => {
    it("renders enabled by default", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
      expect(input).not.toHaveClass("cursor-not-allowed", "opacity-60");
    });

    it("renders disabled when disabled prop is true", () => {
      render(<Input value="" onChange={() => {}} disabled={true} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
      expect(input).toHaveClass("cursor-not-allowed", "opacity-60");
    });

    it("does not call onChange when disabled", async () => {
      const handleChange = vi.fn();
      render(<Input value="" onChange={handleChange} disabled={true} />);
      
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test");
      
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    it("renders without error styling by default", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveClass("ring-1", "ring-error");
    });

    it("renders with error styling when error is provided", () => {
      render(<Input value="" onChange={() => {}} error="This field is required" />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("ring-1", "ring-error");
    });

    it("does not render with error styling for empty error string", () => {
      render(<Input value="" onChange={() => {}} error="" />);
      
      const input = screen.getByRole("textbox");
      // Empty string is falsy in JavaScript, so error styling should not be applied
      expect(input).not.toHaveClass("ring-1", "ring-error");
    });
  });

  describe("accessibility", () => {
    it("has correct role for text input", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("can be associated with a label using id", () => {
      const { container } = render(
        <>
          <label htmlFor="email-field">Email Address</label>
          <Input id="email-field" type="email" value="" onChange={() => {}} />
        </>
      );
      
      const label = screen.getByText("Email Address");
      const input = screen.getByRole("textbox");
      
      expect(label).toHaveAttribute("for", "email-field");
      expect(input).toHaveAttribute("id", "email-field");
    });

    it("supports keyboard navigation", async () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      
      // Tab to the input
      await userEvent.tab();
      expect(input).toHaveFocus();
    });

    it("maintains focus styling classes", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("focus:ring-1", "focus:ring-primary/50");
    });
  });

  describe("base styling", () => {
    it("has correct base classes", () => {
      render(<Input value="" onChange={() => {}} />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "w-full",
        "rounded-lg",
        "border-none",
        "bg-surface-container",
        "px-4",
        "py-2.5",
        "text-sm",
        "text-on-surface",
        "transition-all"
      );
    });

    it("has placeholder styling classes", () => {
      render(<Input value="" onChange={() => {}} placeholder="Type here" />);
      
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("placeholder:text-outline/50");
    });
  });

  describe("integration scenarios", () => {
    it("works with controlled component pattern", async () => {
      function ControlledInput() {
        const [value, setValue] = useState("");
        return (
          <Input 
            value={value} 
            onChange={setValue} 
            placeholder="Type something" 
          />
        );
      }
      
      const { rerender } = render(<ControlledInput />);
      
      const input = screen.getByPlaceholderText("Type something");
      expect(input).toHaveValue("");
      
      await userEvent.type(input, "test");
      // In a real controlled component, the value would update
      // This test verifies the component accepts controlled props
    });

    it("can be used in a form context", () => {
      render(
        <form>
          <Input 
            id="username" 
            type="text" 
            value="johndoe" 
            onChange={() => {}} 
          />
        </form>
      );
      
      const input = screen.getByDisplayValue("johndoe");
      expect(input).toBeInTheDocument();
      expect(input.closest("form")).toBeInTheDocument();
    });
  });
});

// Need to import useState for the integration test
import { useState } from "react";
