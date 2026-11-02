import React, { useState } from "react";
import axios from "../axiosInstance";
import { MapPinIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "../ui/icons";

const EMPTY = {
  fullName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const FIELDS = [
  { key: "fullName", label: "Full Name", span: 1 },
  { key: "phone", label: "Phone", span: 1 },
  { key: "address1", label: "Address Line 1", span: 2 },
  { key: "address2", label: "Address Line 2 (optional)", span: 2 },
  { key: "city", label: "City", span: 1 },
  { key: "state", label: "State", span: 1 },
  { key: "pincode", label: "Pincode", span: 1 },
];

// Older address documents used different field names
const toForm = (a) => ({
  fullName: a.fullName || a.name || "",
  phone: a.phone || "",
  address1: a.address1 || a.line1 || "",
  address2: a.address2 || a.line2 || "",
  city: a.city || "",
  state: a.state || "",
  pincode: a.pincode || a.zip || "",
  isDefault: !!a.isDefault,
});

function AddressItem({ addr, onEdit, onDelete }) {
  return (
    <div
      className={`p-3 rounded-xl border ${addr.isDefault ? "border-accent/30 bg-accent/10" : "border-line"} flex justify-between items-start gap-2.5`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-bold text-ink text-xs sm:text-sm">
            {addr.fullName || addr.name}
          </span>
          {addr.isDefault && (
            <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.2 rounded-full">
              Default
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted">
          {addr.address1 || addr.line1}
          {addr.address2 || addr.line2 ? `, ${addr.address2 || addr.line2}` : ""}
        </p>
        <p className="text-[11px] text-muted">
          {addr.city}, {addr.state} {addr.pincode || addr.zip}
        </p>
        <p className="text-[10px] text-muted-light mt-0.5 font-mono">{addr.phone}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-muted-light hover:text-ink-soft hover:bg-tint transition"
        >
          <PencilIcon size={11} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-muted-light hover:text-alert hover:bg-alert/10 transition"
        >
          <Trash2Icon size={11} />
        </button>
      </div>
    </div>
  );
}

export default function AddressBook({ addresses, setAddresses, notify }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding, address = editing it
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const openForm = (addr = null) => {
    setEditing(addr);
    setForm(addr ? toForm(addr) : { ...EMPTY });
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = async () => {
    const { fullName, phone, address1, city, state, pincode } = form;
    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      return notify("error", "Please fill all required fields.");
    }
    try {
      setSaving(true);
      const res = editing
        ? await axios.put(`/api/profile/addresses/${editing._id}`, form)
        : await axios.post("/api/profile/addresses", form);
      setAddresses(res.data.addresses || []);
      closeForm();
      setForm({ ...EMPTY });
      notify("success", editing ? "Address updated!" : "Address added!");
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      const res = await axios.delete(`/api/profile/addresses/${id}`);
      setAddresses(res.data.addresses || []);
      notify("success", "Address removed.");
    } catch (e) {
      notify("error", e?.response?.data?.message || "Failed to delete address.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-line shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-base font-bold text-ink flex items-center gap-1.5">
          <MapPinIcon className="text-accent text-xs sm:text-sm" /> Saved Addresses
        </h3>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-black transition px-2 py-0.5 rounded-lg hover:bg-tint"
        >
          <PlusIcon size={10} /> Add
        </button>
      </div>

      {addresses.length === 0 && !open ? (
        <div className="text-center py-6">
          <MapPinIcon className="mx-auto text-muted-faint mb-2" size={22} />
          <p className="text-xs text-muted">No saved addresses yet.</p>
          <button
            onClick={() => openForm()}
            className="mt-2 text-xs font-bold text-accent hover:underline"
          >
            + Add Address
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {addresses.map((addr) => (
            <AddressItem
              key={addr._id}
              addr={addr}
              onEdit={() => openForm(addr)}
              onDelete={() => remove(addr._id)}
            />
          ))}
        </div>
      )}

      {open && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-ink text-xs sm:text-sm">
              {editing ? "Edit Address" : "New Address"}
            </h4>
            <button onClick={closeForm} className="text-muted-light hover:text-muted">
              <XIcon size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1 block">
                  {f.label}
                </label>
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-line-strong focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none text-xs transition-all"
                />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 mt-2.5 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((s) => ({ ...s, isDefault: e.target.checked }))}
              className="rounded border-line-strong text-accent focus:ring-accent/30"
            />
            Set as default address
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="mt-3.5 w-full py-2.5 rounded-xl bg-ink text-white font-bold text-xs shadow-xs hover:bg-black transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : editing ? "Update Address" : "Save Address"}
          </button>
        </div>
      )}
    </div>
  );
}
