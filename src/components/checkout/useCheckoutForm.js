import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../axiosInstance";
import { qk } from "../../query/queryKeys";

const EMPTY = {
  fullName: "",
  phone: "",
  pincode: "",
  city: "",
  state: "",
  address1: "",
  address2: "",
  email: "",
};

// Copies a saved address into the form; older documents used different field names.
const withAddress = (d, a) => ({
  ...d,
  fullName: a.fullName || a.name || d.fullName,
  phone: a.phone || d.phone,
  email: a.email || d.email,
  address1: a.address1 || a.line1 || d.address1,
  address2: a.address2 || a.line2 || d.address2,
  city: a.city || d.city,
  state: a.state || d.state,
  pincode: a.pincode || a.zip || d.pincode,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Delivery details: field state, validation, saved addresses and the one-line address sent with the order.
export default function useCheckoutForm({ totalAmount, isAuthenticated }) {
  const [data, setData] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const { data: addresses = [] } = useQuery({
    queryKey: qk.profile.addresses,
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await axios.get("/api/profile/addresses");
      return Array.isArray(res?.data?.addresses) ? res.data.addresses : [];
    },
    staleTime: 60 * 1000,
  });

  // Start with the default saved address filled in
  useEffect(() => {
    if (!addresses.length || selectedAddressId) return;
    const def = addresses.find((a) => a.isDefault) || addresses[0];
    if (!def) return;
    setSelectedAddressId(def._id);
    setData((d) => withAddress(d, def));
  }, [addresses, selectedAddressId]);

  const selectAddress = (a) => {
    setSelectedAddressId(a._id);
    setData((d) => withAddress(d, a));
  };

  const setField = (name, value) => {
    setData((d) => (d[name] === value ? d : { ...d, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const markTouched = (name) => setTouched((t) => (t[name] ? t : { ...t, [name]: true }));

  const validate = useCallback(() => {
    const v = {};
    if (!data.fullName.trim()) v.fullName = "Name is required";
    if (!/^[6-9]\d{9}$/.test((data.phone || "").replace(/\D/g, "")))
      v.phone = "Enter a valid 10-digit mobile";
    if (!/^\d{6}$/.test((data.pincode || "").replace(/\D/g, "")))
      v.pincode = "Enter a valid 6-digit pincode";
    if (!data.city.trim()) v.city = "City is required";
    if (!data.state.trim()) v.state = "State is required";
    if (!data.address1.trim()) v.address1 = "Address is required";
    if (!data.email.trim() || !EMAIL_RE.test(data.email)) v.email = "Valid email required";
    if (!(Number(totalAmount) > 0)) v.amount = "Invalid amount";
    return v;
  }, [data, totalAmount]);

  // Validates everything and reports whether the form can move on to the review step
  const submit = () => {
    const v = validate();
    setErrors(v);
    setTouched(Object.keys(data).reduce((a, k) => ({ ...a, [k]: true }), {}));
    return Object.keys(v).length === 0;
  };

  const fullAddress = useMemo(() => {
    const p = (s) => String(s || "").trim();
    return `${p(data.fullName)}, ${p(data.address1)}${
      p(data.address2) ? ", " + p(data.address2) : ""
    }, ${p(data.city)} ${p(data.pincode)}, ${p(data.state)}. Phone: ${p(data.phone)}`;
  }, [data]);

  // Props for an <InputField> bound to one form field
  const field = (name, extra = {}) => ({
    name,
    value: data[name],
    error: errors[name],
    touched: touched[name],
    onChange: (e) => setField(name, e.target.value),
    onBlur: () => markTouched(name),
    ...extra,
  });

  return { data, addresses, selectedAddressId, selectAddress, field, submit, fullAddress };
}
