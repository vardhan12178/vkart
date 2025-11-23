import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

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

  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block w-full sm:w-48 text-left align-top"
    >
      <button
        type="button"
        onClick={handleToggle}
        className={`
          group inline-flex w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200
          ${isOpen 
            ? "border-gray-900 ring-1 ring-gray-900" 
            : "border-gray-200 hover:border-gray-300"
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedLabel}</span>
        
        {/* Arrow Icon with Rotation Animation */}
        <FaChevronDown 
          className={`ml-2 h-3 w-3 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-full min-w-[12rem] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/5 animate-scale-in origin-top-right"
          role="listbox"
        >
          <div className="max-h-[60vh] overflow-auto py-1.5">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option)}
                  className={`
                    relative flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors
                    ${active
                      ? "bg-gray-50 text-gray-900 font-bold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                    }
                  `}
                  role="option"
                  aria-selected={active}
                >
                  <span>{option.label}</span>
                  
                  {/* Checkmark for active item */}
                  {active && (
                    <FaCheck className="text-orange-500" size={10} />
                  )}
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