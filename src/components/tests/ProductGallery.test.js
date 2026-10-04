import { render, screen } from "@testing-library/react";
import ProductGallery from "../product/ProductGallery";
import ProductRail from "../product/ProductRail";

describe("ProductGallery", () => {
  test("a single image shows no arrows or thumbnails", () => {
    render(<ProductGallery images={["/a.webp"]} title="Desk Lamp" />);
    expect(screen.getByRole("img", { name: "Desk Lamp" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /next image/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /show image/i })).not.toBeInTheDocument();
  });

  test("several images get arrows and one thumbnail each, first selected", () => {
    render(<ProductGallery images={["/a.webp", "/b.webp", "/c.webp"]} title="Desk Lamp" />);
    expect(screen.getByRole("button", { name: /previous image/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next image/i })).toBeInTheDocument();
    const thumbs = screen.getAllByRole("button", { name: /show image/i });
    expect(thumbs).toHaveLength(3);
    expect(thumbs[0]).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("img", { name: "Desk Lamp — view 2" })).toBeInTheDocument();
  });

  test("renders overlay children (e.g. an out-of-stock badge)", () => {
    render(
      <ProductGallery images={["/a.webp"]} title="Desk Lamp">
        <span>Out of Stock</span>
      </ProductGallery>
    );
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });
});

describe("ProductRail", () => {
  test("renders every item through renderItem inside a labelled carousel", () => {
    const items = [{ _id: "1", title: "One" }, { _id: "2", title: "Two" }];
    render(<ProductRail label="Picked for you" items={items} slideClassName="basis-1/2" renderItem={(p) => <a href="#x">{p.title}</a>} />);
    expect(screen.getByRole("region", { name: "Picked for you" })).toBeInTheDocument();
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });
});
