import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import CookieBanner from "../CookieBanner";

describe("CookieBanner Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderBanner = () =>
    render(
      <BrowserRouter>
        <CookieBanner />
      </BrowserRouter>
    );

  test("appears after the initial delay when no consent choice is stored", async () => {
    renderBanner();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("dialog", {}, { timeout: 1500 })).toBeInTheDocument();
    expect(screen.getByText(/a more considered experience/i)).toBeInTheDocument();
  });

  test("does not appear if a consent choice was already stored", async () => {
    localStorage.setItem("cookieConsent", "accepted");
    renderBanner();
    await new Promise((r) => setTimeout(r, 1000));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("saves 'accepted' and hides the banner when Accept all is clicked", async () => {
    renderBanner();
    await screen.findByRole("dialog", {}, { timeout: 1500 });

    fireEvent.click(screen.getByRole("button", { name: /accept all/i }));

    await waitFor(
      () => {
        expect(localStorage.getItem("cookieConsent")).toBe("accepted");
      },
      { timeout: 1000 }
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  test("saves 'essential' when the close button is used", async () => {
    renderBanner();
    await screen.findByRole("dialog", {}, { timeout: 1500 });

    fireEvent.click(screen.getByRole("button", { name: /close cookie preferences/i }));

    await waitFor(
      () => {
        expect(localStorage.getItem("cookieConsent")).toBe("essential");
      },
      { timeout: 1000 }
    );
  });
});
