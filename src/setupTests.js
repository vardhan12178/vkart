// Vitest setup: jest-dom matchers (toBeInTheDocument, ...) plus the few
// browser APIs jsdom doesn't implement.
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

window.scrollTo = vi.fn();

class IntersectionObserver {
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
window.IntersectionObserver = IntersectionObserver;
