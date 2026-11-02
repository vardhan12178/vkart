import React from "react";
import { MailIcon, PhoneIcon, UserIcon } from "../ui/icons";
import InputField from "./InputField";
import SectionTitle from "./SectionTitle";

export default function ContactFields({ field }) {
  return (
    <div className="mb-4 sm:mb-6">
      <SectionTitle>Contact Info</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        <InputField
          label="Full Name"
          icon={UserIcon}
          placeholder="Enter your name"
          {...field("fullName")}
        />
        <InputField
          label="Mobile Number"
          inputMode="numeric"
          icon={PhoneIcon}
          placeholder="9876543210"
          {...field("phone")}
        />
        <div className="md:col-span-2">
          <InputField
            label="Email Address"
            type="email"
            icon={MailIcon}
            placeholder="your.email@example.com"
            {...field("email")}
          />
        </div>
      </div>
    </div>
  );
}
