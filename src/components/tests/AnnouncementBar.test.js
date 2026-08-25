import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import AnnouncementBar from "../AnnouncementBar";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

jest.mock("framer-motion", () => {
  const mockReact = require("react");
  const strip = (props) => {
    const { initial, animate, exit, variants, transition, mode, custom, ...rest } = props;
    return rest;
  };
  return {
    motion: new Proxy(
      {},
      { get: (_t, tag) => ({ children, ...props }) => mockReact.createElement(tag, strip(props), children) }
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe("AnnouncementBar Component", () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  const renderBar = () =>
    render(
      <BrowserRouter>
        <AnnouncementBar />
      </BrowserRouter>
    );

  test("shows the fallback message when the API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderBar();
    expect(await screen.findByText(/complimentary delivery on orders over/i)).toBeInTheDocument();
  });

  test("shows announcements fetched from the API", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ text: "Custom sale announcement", link: "/products?sale=true" }],
    });
    renderBar();
    expect(await screen.findByText("Custom sale announcement")).toBeInTheDocument();
  });

  test("dismisses the bar when the close button is clicked", async () => {
    axios.get.mockRejectedValueOnce(new Error("network down"));
    renderBar();
    await screen.findByText(/complimentary delivery on orders over/i);

    fireEvent.click(screen.getByLabelText(/close announcement/i));

    await waitFor(() => {
      expect(screen.queryByText(/complimentary delivery on orders over/i)).not.toBeInTheDocument();
    });
  });
});
