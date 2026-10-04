import { vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";
import WebVitalsCard from "../admin/WebVitalsCard";
import axios from "../axiosInstance";

vi.mock("../axiosInstance");

const renderCard = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <WebVitalsCard />
    </QueryClientProvider>
  );

describe("WebVitalsCard", () => {
  beforeEach(() => axios.get.mockReset());

  it("shows an empty state before any samples exist", async () => {
    axios.get.mockResolvedValue({ data: { metrics: { LCP: { count: 0, p75: null } } } });
    renderCard();
    expect(await screen.findByText(/no data yet/i)).toBeInTheDocument();
  });

  it("formats p75 values per metric", async () => {
    axios.get.mockResolvedValue({
      data: {
        windowSize: 1000,
        metrics: {
          LCP: { count: 40, p75: 2140, good: 80, needsImprovement: 15, poor: 5 },
          INP: { count: 12, p75: 180.4, good: 90, needsImprovement: 10, poor: 0 },
          CLS: { count: 40, p75: 0.031, good: 100, needsImprovement: 0, poor: 0 },
          FCP: { count: 40, p75: 1200, good: 95, needsImprovement: 5, poor: 0 },
          TTFB: { count: 40, p75: 950, good: 60, needsImprovement: 40, poor: 0 },
        },
      },
    });
    renderCard();
    expect(await screen.findByText("2.14s")).toBeInTheDocument();
    expect(screen.getByText("180ms")).toBeInTheDocument();
    expect(screen.getByText("0.03")).toBeInTheDocument();
    expect(screen.getByText("950ms")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith("/api/admin/vitals");
  });

  it("shows an error message when the request fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("boom"));
    renderCard();
    expect(await screen.findByText(/could not load performance data/i)).toBeInTheDocument();
  });
});
