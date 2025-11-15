import React, { useState } from "react";
import {
  PencilIcon,
  PhotographIcon,
  MailIcon,
  PhoneIcon,
  DocumentTextIcon,
  IdentificationIcon,
} from "@heroicons/react/outline";

export default function AdminSettings() {
  const [storeName, setStoreName] = useState("VKart");
  const [tagline, setTagline] = useState("Premium Lifestyle Store");
  const [businessName, setBusinessName] = useState("VKart Retail Pvt Ltd");
  const [gstNumber, setGstNumber] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("Thank you for shopping with VKart!");
  const [supportEmail, setSupportEmail] = useState("support@vkartshop.in");
  const [supportPhone, setSupportPhone] = useState("+91 99999 12345");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* STORE BRANDING */}
      <Section title="Store Branding">
        <Field
          label="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        <Field
          label="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Store Logo</label>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-100 border rounded-xl flex items-center justify-center">
              <PhotographIcon className="h-8 w-8 text-gray-400" />
            </div>

            <button className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200">
              Upload Logo
            </button>
          </div>
        </div>
      </Section>

      {/* ADMIN SETTINGS */}
      <Section title="Admin Profile">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <IdentificationIcon className="h-6 w-6 text-gray-500" />
          <div>
            <p className="font-medium text-gray-800">Admin Account</p>
            <p className="text-xs text-gray-500">Logged in as: balavardhan12178@gmail.com</p>
          </div>
        </div>

        <button className="text-sm px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black mt-2">
          Change Password
        </button>
      </Section>

      {/* INVOICE CONFIG */}
      <Section title="Invoice Settings">
        <Field
          label="Business / Legal Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          icon={<DocumentTextIcon className="h-5 w-5 text-gray-400" />}
        />

        <Field
          label="GST Number (Optional)"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
        />

        <Field
          label="Invoice Footer Note"
          value={invoiceNote}
          onChange={(e) => setInvoiceNote(e.target.value)}
        />
      </Section>

      {/* SUPPORT CONTACT */}
      <Section title="Support Contact">
        <Field
          label="Support Email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          icon={<MailIcon className="h-5 w-5 text-gray-400" />}
        />

        <Field
          label="Support Phone"
          value={supportPhone}
          onChange={(e) => setSupportPhone(e.target.value)}
          icon={<PhoneIcon className="h-5 w-5 text-gray-400" />}
        />
      </Section>

      {/* SAVE BUTTON */}
      <div className="mt-8">
        <button className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Components ----------------------------- */

function Section({ title, children }) {
  return (
    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, icon }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm ${
            icon ? "pl-10" : ""
          }`}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
