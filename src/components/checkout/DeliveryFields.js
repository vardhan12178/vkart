import React from "react";
import { Building2Icon, GlobeIcon, MailboxIcon, MapPinIcon } from "../ui/icons";
import InputField from "./InputField";
import SectionTitle from "./SectionTitle";

export default function DeliveryFields({ field }) {
  return (
    <div>
      <SectionTitle>Delivery Address</SectionTitle>

      <InputField
        label="Address Line 1"
        icon={MapPinIcon}
        placeholder="House No, Street, Area"
        {...field("address1")}
      />
      {/* Optional, so no validation state is wired */}
      <InputField
        label="Address Line 2 (Optional)"
        icon={MapPinIcon}
        placeholder="Landmark (Optional)"
        {...field("address2", { error: undefined, touched: undefined, onBlur: undefined })}
      />

      <div className="grid grid-cols-2 gap-x-4">
        <InputField label="City" icon={Building2Icon} placeholder="City" {...field("city")} />
        <InputField label="State" icon={GlobeIcon} placeholder="State" {...field("state")} />
      </div>
      <div className="w-1/2 pr-2">
        <InputField
          label="Pincode"
          inputMode="numeric"
          icon={MailboxIcon}
          placeholder="500001"
          {...field("pincode")}
        />
      </div>
    </div>
  );
}
