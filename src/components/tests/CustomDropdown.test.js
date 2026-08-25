import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CustomDropdown from "../CustomDropdown";

const OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
];

describe("CustomDropdown Component", () => {
  test("shows the label when no option is selected", () => {
    render(<CustomDropdown options={OPTIONS} value="" onChange={jest.fn()} label="Sort By" />);
    expect(screen.getByText("Sort By")).toBeInTheDocument();
  });

  test("shows the selected option's label", () => {
    render(<CustomDropdown options={OPTIONS} value="price-asc" onChange={jest.fn()} label="Sort By" />);
    expect(screen.getByText("Price: Low to High")).toBeInTheDocument();
  });

  test("opens the menu and selects an option", () => {
    const onChange = jest.fn();
    render(<CustomDropdown options={OPTIONS} value="" onChange={onChange} label="Sort By" />);

    fireEvent.click(screen.getByRole("button", { name: /sort by/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "Relevance" }));
    expect(onChange).toHaveBeenCalledWith("relevance");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("closes the menu when clicking outside", () => {
    render(
      <div>
        <CustomDropdown options={OPTIONS} value="" onChange={jest.fn()} label="Sort By" />
        <button>Outside</button>
      </div>
    );
    fireEvent.click(screen.getByRole("button", { name: /sort by/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("closes the menu when Escape is pressed", () => {
    render(<CustomDropdown options={OPTIONS} value="" onChange={jest.fn()} label="Sort By" />);
    fireEvent.click(screen.getByRole("button", { name: /sort by/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
