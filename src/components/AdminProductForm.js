import React, { useState, useEffect } from "react";
import ProductImageUploader from "./ProductImageUploader";

export default function AdminProductForm({ initialData = null, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    discountPercentage: "",
    stock: "",
    sku: "",
    tags: "",
    thumbnail: "",
    images: [],
    weight: "",
    width: "",
    height: "",
    depth: "",
    warrantyInformation: "",
    shippingInformation: "",
    returnPolicy: "",
    isActive: true,
  });

  // Fill edit mode
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        price: initialData.price || "",
        discountPercentage: initialData.discountPercentage || "",
        stock: initialData.stock || "",
        sku: initialData.sku || "",
        tags: (initialData.tags || []).join(", "),
        thumbnail: initialData.thumbnail || "",
        images: initialData.images || [],
        weight: initialData.weight || "",
        width: initialData.dimensions?.width || "",
        height: initialData.dimensions?.height || "",
        depth: initialData.dimensions?.depth || "",
        warrantyInformation: initialData.warrantyInformation || "",
        shippingInformation: initialData.shippingInformation || "",
        returnPolicy: initialData.returnPolicy || "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submitForm = (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      brand: form.brand,
      price: Number(form.price),
      discountPercentage: Number(form.discountPercentage),
      stock: Number(form.stock),
      sku: form.sku,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      thumbnail: form.thumbnail,
      images: form.images,
      weight: Number(form.weight),
      dimensions: {
        width: Number(form.width),
        height: Number(form.height),
        depth: Number(form.depth),
      },
      warrantyInformation: form.warrantyInformation,
      shippingInformation: form.shippingInformation,
      returnPolicy: form.returnPolicy,
      isActive: form.isActive,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={submitForm} className="space-y-4 p-4">

      {/* Title */}
      <div>
        <label className="font-medium">Product Title</label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border p-2 rounded"
          rows={3}
          required
        />
      </div>

      {/* Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-medium">Category</label>
          <input
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="font-medium">Brand</label>
          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">SKU</label>
          <input
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      {/* Price / Discount / Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-medium">Price</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="font-medium">Discount %</label>
          <input
            type="number"
            value={form.discountPercentage}
            onChange={(e) => update("discountPercentage", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="font-medium">Tags (comma separated)</label>
        <input
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Thumbnail uploader */}
      <ProductImageUploader
        label="Thumbnail"
        mode="single"
        initial={form.thumbnail ? [form.thumbnail] : []}
        onUpload={(url) => update("thumbnail", url)}
        />



      {/* Multiple images uploader */}
      <ProductImageUploader
        label="Product Images"
        mode="multiple"
        limit={5}
        initial={Array.isArray(form.images) ? form.images : []}
        onUpload={(urls) => update("images", urls)}
        />


      {/* Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          placeholder="Width"
          value={form.width}
          onChange={(e) => update("width", e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Height"
          value={form.height}
          onChange={(e) => update("height", e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Depth"
          value={form.depth}
          onChange={(e) => update("depth", e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Warranty */}
      <div>
        <label className="font-medium">Warranty Information</label>
        <input
          value={form.warrantyInformation}
          onChange={(e) => update("warrantyInformation", e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Shipping */}
      <div>
        <label className="font-medium">Shipping Information</label>
        <input
          value={form.shippingInformation}
          onChange={(e) => update("shippingInformation", e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Return Policy */}
      <div>
        <label className="font-medium">Return Policy</label>
        <input
          value={form.returnPolicy}
          onChange={(e) => update("returnPolicy", e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Active */}
      <div>
        <label className="font-medium">Status</label>
        <select
          value={form.isActive}
          onChange={(e) => update("isActive", e.target.value === "true")}
          className="w-full border p-2 rounded"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:brightness-110"
        >
          {initialData ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
