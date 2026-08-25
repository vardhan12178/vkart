import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import Careers from "../Careers";

describe("Careers Component", () => {
  const renderCareers = () =>
    render(
      <BrowserRouter>
        <Careers />
      </BrowserRouter>
    );

  test("renders all seeded roles", () => {
    renderCareers();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  test("filters roles by search text", () => {
    renderCareers();
    fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: "backend" } });

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Frontend Engineer")).not.toBeInTheDocument();
  });

  test("filters roles by department", () => {
    renderCareers();
    const [deptSelect] = screen.getAllByRole("combobox");
    fireEvent.change(deptSelect, { target: { value: "Design" } });

    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.queryByText("Frontend Engineer")).not.toBeInTheDocument();
  });

  test("shows an empty state when no roles match", () => {
    renderCareers();
    fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: "nonexistent-role-xyz" } });
    expect(screen.getByText(/no roles match/i)).toBeInTheDocument();
  });

  test("expands and collapses a role's details", () => {
    renderCareers();
    const viewButtons = screen.getAllByRole("button", { name: /view details/i });
    fireEvent.click(viewButtons[0]);

    expect(screen.getByRole("button", { name: /hide details/i })).toBeInTheDocument();
  });

  test("shows a confirmation toast after applying", async () => {
    renderCareers();
    const applyButtons = screen.getAllByRole("button", { name: /^apply$/i });
    fireEvent.click(applyButtons[0]);

    expect(await screen.findByText(/application submitted for frontend engineer/i)).toBeInTheDocument();
  });
});
