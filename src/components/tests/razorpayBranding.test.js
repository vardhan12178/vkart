import { withBranding, prefillFrom } from "../../utils/razorpayBranding";

describe("withBranding", () => {
  const original = window.location;
  const setOrigin = (href) => {
    delete window.location;
    window.location = new URL(href);
  };
  afterEach(() => {
    window.location = original;
  });

  test("adds the logo on https, the brand colour, and a confirm-before-close prompt", () => {
    setOrigin("https://vkartshop.netlify.app/checkout");
    expect(withBranding({ amount: 500 })).toEqual({
      amount: 500,
      image: "https://vkartshop.netlify.app/icon-512.png",
      theme: { color: "#1d1c19" },
      modal: { confirm_close: true },
    });
  });

  test("leaves the logo out on plain http, where Razorpay could not fetch it", () => {
    setOrigin("http://localhost:3000/checkout");
    expect(withBranding({})).not.toHaveProperty("image");
  });

  test("keeps the caller's own modal handlers and lets explicit options win", () => {
    setOrigin("https://vkartshop.netlify.app/");
    const ondismiss = jest.fn();
    const out = withBranding({ theme: { color: "#fff" }, modal: { ondismiss } });
    expect(out.modal).toEqual({ confirm_close: true, ondismiss });
    expect(out.theme).toEqual({ color: "#fff" });
  });
});

describe("prefillFrom", () => {
  test("drops missing details so Razorpay asks for them", () => {
    expect(prefillFrom({ name: "Asha Rao", email: "", contact: undefined })).toEqual({ name: "Asha Rao" });
    expect(prefillFrom()).toEqual({});
  });
});
