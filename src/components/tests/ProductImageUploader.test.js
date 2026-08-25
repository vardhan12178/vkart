import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProductImageUploader from "../ProductImageUploader";
import axios from "../axiosInstance";

jest.mock("../axiosInstance");

jest.mock("browser-image-compression", () => {
  const fn = jest.fn().mockResolvedValue(new Blob(["fake-compressed"], { type: "image/webp" }));
  fn.getDataUrlFromFile = jest.fn().mockResolvedValue("data:image/webp;base64,ZmFrZQ==");
  return fn;
});

describe("ProductImageUploader Component", () => {
  let alertSpy;

  beforeAll(() => {
    global.fetch = jest.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(["fake"], { type: "image/webp" })),
    });
  });

  beforeEach(() => {
    axios.post.mockReset();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  const getFileInput = (container) => container.querySelector('input[type="file"]');

  test("renders the empty dropzone", () => {
    render(<ProductImageUploader label="Thumbnail" onUpload={jest.fn()} />);
    expect(screen.getByText("Thumbnail")).toBeInTheDocument();
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
  });

  test("rejects a non-image file type", async () => {
    const onUpload = jest.fn();
    const { container } = render(<ProductImageUploader label="Thumbnail" onUpload={onUpload} />);
    const textFile = new File(["hello"], "notes.txt", { type: "text/plain" });

    fireEvent.change(getFileInput(container), { target: { files: [textFile] } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Only PNG, JPG, JPEG, WEBP allowed.");
    });
    expect(axios.post).not.toHaveBeenCalled();
    expect(onUpload).not.toHaveBeenCalled();
  });

  test("uploads a single image and reports the resulting URL as a string", async () => {
    axios.post.mockResolvedValueOnce({ data: { url: "https://cdn.example.com/thumb.webp" } });
    const onUpload = jest.fn();
    const { container } = render(<ProductImageUploader mode="single" label="Thumbnail" onUpload={onUpload} />);
    const imgFile = new File(["img"], "photo.png", { type: "image/png" });

    fireEvent.change(getFileInput(container), { target: { files: [imgFile] } });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/admin/products/upload", expect.any(FormData));
    });
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith("https://cdn.example.com/thumb.webp");
    });
    expect(await screen.findByAltText("Product")).toHaveAttribute("src", "https://cdn.example.com/thumb.webp");
  });

  test("uploads a multiple-mode image and reports an array", async () => {
    axios.post.mockResolvedValueOnce({ data: { url: "https://cdn.example.com/gallery1.webp" } });
    const onUpload = jest.fn();
    const { container } = render(
      <ProductImageUploader mode="multiple" limit={3} label="Gallery" onUpload={onUpload} />
    );
    const imgFile = new File(["img"], "photo.jpg", { type: "image/jpeg" });

    fireEvent.change(getFileInput(container), { target: { files: [imgFile] } });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(["https://cdn.example.com/gallery1.webp"]);
    });
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  test("removes an uploaded image", async () => {
    axios.post.mockResolvedValueOnce({ data: { url: "https://cdn.example.com/thumb.webp" } });
    const onUpload = jest.fn();
    const { container } = render(<ProductImageUploader mode="single" label="Thumbnail" onUpload={onUpload} />);
    const imgFile = new File(["img"], "photo.png", { type: "image/png" });
    fireEvent.change(getFileInput(container), { target: { files: [imgFile] } });
    await screen.findByAltText("Product");

    fireEvent.click(screen.getByTitle("Remove Image"));

    expect(onUpload).toHaveBeenLastCalledWith("");
    expect(screen.queryByAltText("Product")).not.toBeInTheDocument();
  });

  test("shows an alert when the upload request fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("network down"));
    const { container } = render(<ProductImageUploader mode="single" label="Thumbnail" onUpload={jest.fn()} />);
    const imgFile = new File(["img"], "photo.png", { type: "image/png" });

    fireEvent.change(getFileInput(container), { target: { files: [imgFile] } });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Image upload failed. Check console.");
    });
  });
});
