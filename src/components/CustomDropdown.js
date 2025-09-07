import React, { useState, useRef, useEffect } from "react";

const CustomDropdown = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      // Mobile: full width, Tablet: ~176px, Desktop+: ~224px
      className="relative inline-block w-full sm:w-44 lg:w-56 text-left align-top"
    >
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-0 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {options.find((o) => o.value === value)?.label || label}
        <svg
          className="ml-2 h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-20 mt-2 w-full min-w-[10rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5"
          role="listbox"
        >
          <div className="max-h-[60vh] overflow-auto py-1">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option)}
                  className={`block w-full px-4 py-2 text-left text-sm ${
                    active
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-orange-50 hover:text-gray-900"
                  }`}
                  role="option"
                  aria-selected={active}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
