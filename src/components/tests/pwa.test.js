import fs from "fs";
import path from "path";

const pub = (f) => path.join(__dirname, "../../../public", f);
const manifest = JSON.parse(fs.readFileSync(pub("manifest.json"), "utf8"));

describe("installable app files", () => {
  test("manifest has what browsers need to offer installation", () => {
    expect(manifest).toMatchObject({
      display: "standalone",
      start_url: expect.any(String),
      scope: "/",
      theme_color: "#1d1c19",
    });
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  test("every icon and shortcut icon in the manifest exists", () => {
    const files = [...manifest.icons, ...manifest.shortcuts.flatMap((s) => s.icons)].map((i) =>
      i.src.replace(/^\//, "")
    );
    files.forEach((f) => expect(fs.existsSync(pub(f))).toBe(true));
  });

  test("the offline page and service worker are present, and the worker leaves the API alone", () => {
    expect(fs.existsSync(pub("offline.html"))).toBe(true);
    const sw = fs.readFileSync(pub("service-worker.js"), "utf8");
    expect(sw).toContain("/offline.html");
    expect(sw).toContain("/api/");
    expect(sw).toContain("request.method !== 'GET'");
  });
});
