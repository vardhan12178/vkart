import React from "react";
import { FaBolt, FaShieldAlt, FaTag, FaTruck } from "react-icons/fa";

const BENEFITS = [
  {
    icon: <FaTag />,
    title: "Extra Discounts",
    desc: "Exclusive Prime-only sale prices on every sale",
  },
  {
    icon: <FaTruck />,
    title: "Free Shipping",
    desc: "Free delivery on all orders, no minimum",
  },
  {
    icon: <FaBolt />,
    title: "Early Access",
    desc: "Shop sales 24 hours before everyone else",
  },
  {
    icon: <FaShieldAlt />,
    title: "Priority Support",
    desc: "Dedicated support with faster resolution",
  },
];

export default function BenefitsGrid() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-black text-gray-900 text-center mb-10">What You Get</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFITS.map((b, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-600 text-lg">
              {b.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
            <p className="text-sm text-gray-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
