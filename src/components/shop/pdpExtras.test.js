import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeliveryCheck, { deliveryWindow, placeLabel } from "./DeliveryCheck";
import OffersEmi, { emi, emiPlans } from "./OffersEmi";
import { sizeGuideFor } from "./SizeGuide";
import { fetchDelivery } from "./catalogApi";

jest.mock("./catalogApi", () => ({ ...jest.requireActual("./catalogApi"), fetchDelivery: jest.fn() }));

const fashion = (sub, gender, sizes) => ({
  category: "fashion", categoryPath: ["fashion", gender.toLowerCase(), sub], keySpecs: { gender },
  variantOptions: [{ name: "Size", values: sizes.map((value) => ({ value })) }],
});

describe("size guides", () => {
  test("picks the chart from the category and the size values", () => {
    expect(sizeGuideFor(fashion("jeans", "Men", ["30", "32"]))).toMatchObject({ kind: "waist", rows: [["30", { n: 30 }, { n: 38 }], ["32", { n: 32 }, { n: 40 }]] });
    expect(sizeGuideFor(fashion("running", "Men", ["UK 8", "UK 9"])).rows[0]).toEqual(["UK 8", "9", "42", "26.2"]);
    expect(sizeGuideFor(fashion("dresses", "Women", ["XS", "S"])).kind).toBe("women");
    expect(sizeGuideFor(fashion("shirts", "Men", ["XS-36", "S-38"])).rows[1]).toEqual(["S-38", { unit: "in", n: 38 }]);
    expect(sizeGuideFor(fashion("chinos", "Men", ["S", "M"])).kind).toBe("men-bottoms");
    expect(sizeGuideFor(fashion("bangles", "Women", ["2.4", "2.6"])).rows[0]).toEqual(["2.4", "57.2"]);
  });

  test("no guide for one-size items or other categories", () => {
    expect(sizeGuideFor(fashion("earrings", "Women", ["One Size"]))).toBeNull();
    expect(sizeGuideFor({ ...fashion("shirts", "Men", ["S", "M"]), category: "mobiles" })).toBeNull();
  });
});

describe("EMI", () => {
  test("no-cost plans split the price; longer plans charge interest", () => {
    expect(emi(12000, 12, 0.14)).toBeCloseTo(1077.43, 1);
    const plans = emiPlans(12000);
    expect(plans.map((p) => p.monthly)).toEqual([4000, 2000, 1413, 1078]);
    expect(plans[1]).toMatchObject({ rate: 0, interest: 0, total: 12000 });
    expect(emiPlans(155000)[0]).toMatchObject({ monthly: 51667, total: 155000, interest: 0 }); // no rounding surcharge
    expect(plans[3].interest).toBe(936);
  });

  test("the plan table opens on demand, and cheap items get no EMI", () => {
    const { rerender } = render(<OffersEmi price={12000} />);
    expect(screen.getByText(/from ₹2,000\/month/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /view plans/i }));
    expect(screen.getByRole("table")).toHaveTextContent("12 months₹1,078₹936 (14% p.a.)₹12,936");
    rerender(<OffersEmi price={999} />);
    expect(screen.queryByText(/No-cost EMI/)).not.toBeInTheDocument();
  });
});

describe("delivery check", () => {
  beforeEach(() => { localStorage.clear(); fetchDelivery.mockReset(); });

  test("date window and place labels", () => {
    const today = new Date(2026, 9, 31); // Sat 31 Oct
    expect(deliveryWindow({ min: 1, max: 2 }, today)).toBe("Tomorrow, Sun, 1 Nov – Mon, 2 Nov");
    expect(deliveryWindow({ min: 3, max: 3 }, today)).toBe("Tue, 3 Nov");
    expect(placeLabel({ area: "Imphal", district: "Imphal", state: "Manipur" })).toBe("Imphal, Manipur");
  });

  test("validates the PIN code before asking the server, then remembers a good one", async () => {
    fetchDelivery.mockResolvedValue({ pincode: "302001", valid: true, serviceable: true, days: { min: 3, max: 5 }, place: { district: "Jaipur", state: "Rajasthan" }, installation: true });
    render(<DeliveryCheck category="appliances" price={45000} />);
    const input = screen.getByLabelText("PIN code");

    fireEvent.change(input, { target: { value: "12a3" } });
    expect(input).toHaveValue("123");
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("Enter a valid 6-digit PIN code.")).toBeInTheDocument();
    expect(fetchDelivery).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "302001" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(/Jaipur, Rajasthan 302001/)).toBeInTheDocument();
    expect(screen.getByText("Free delivery")).toBeInTheDocument();
    expect(screen.getByText(/Installation included/)).toBeInTheDocument();
    expect(localStorage.getItem("vkart:pincode")).toBe("302001");
  });

  test("explains when an address can't be served", async () => {
    fetchDelivery.mockResolvedValue({ pincode: "901234", valid: true, serviceable: false, reason: "We don't deliver to Army Postal Service (APO/FPO) addresses yet." });
    render(<DeliveryCheck category="mobiles" price={20000} />);
    fireEvent.change(screen.getByLabelText("PIN code"), { target: { value: "901234" } });
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await waitFor(() => expect(screen.getByText(/Army Postal Service/)).toBeInTheDocument());
    expect(screen.queryByText(/Free delivery|₹50 delivery/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("PIN code")).toBeInTheDocument(); // still editable
  });
});
