const SRC = "https://checkout.razorpay.com/v1/checkout.js";
const scripts = () => Array.from(document.querySelectorAll(`script[src="${SRC}"]`));

describe("loadRazorpay", () => {
  let loadRazorpay;

  beforeEach(() => {
    jest.resetModules();
    delete window.Razorpay;
    document.body.innerHTML = "";
    ({ loadRazorpay } = require("../../utils/loadRazorpay"));
  });

  test("resolves straight away, without adding a script, when Razorpay is already on the page", async () => {
    window.Razorpay = function Razorpay() {};
    await expect(loadRazorpay()).resolves.toBe(window.Razorpay);
    expect(scripts()).toHaveLength(0);
  });

  test("adds the script once however many callers ask, and resolves when it loads", async () => {
    const first = loadRazorpay();
    const second = loadRazorpay();
    expect(scripts()).toHaveLength(1);

    window.Razorpay = function Razorpay() {};
    scripts()[0].onload();
    await expect(first).resolves.toBe(window.Razorpay);
    await expect(second).resolves.toBe(window.Razorpay);
  });

  test("rejects when the script fails, removes it, and lets a later call try again", async () => {
    const failed = loadRazorpay();
    scripts()[0].onerror();
    await expect(failed).rejects.toThrow(/could not load razorpay/i);
    expect(scripts()).toHaveLength(0);

    loadRazorpay();
    expect(scripts()).toHaveLength(1);
  });
});
