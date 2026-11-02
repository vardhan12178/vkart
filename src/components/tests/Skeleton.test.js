import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RouteSkeleton, Dots, GridSkeleton } from "../ui/Skeleton";

const at = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <RouteSkeleton />
    </MemoryRouter>
  );

describe("Skeleton loaders", () => {
  test.each([
    ["/", /loading the store/i],
    ["/products", /loading products/i],
    ["/products/some-phone", /loading product/i],
    ["/cart", /loading your bag/i],
    ["/profile", /loading your account/i],
    ["/login", /^loading/i],
    ["/admin/orders", /loading the admin panel/i],
    ["/about", /loading page/i],
  ])("%s shows a matching, announced skeleton", (path, label) => {
    const { container } = at(path);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveTextContent(label);
    expect(container.querySelector(".animate-spin")).toBeNull();
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  test("skeleton blocks are hidden from assistive tech", () => {
    const { container } = render(<GridSkeleton count={2} />);
    container
      .querySelectorAll(".skeleton")
      .forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
  });

  test("Dots is decorative", () => {
    const { container } = render(<Dots />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".dot")).toHaveLength(3);
  });
});
