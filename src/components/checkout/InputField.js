import React from "react";

// Labelled text input with an icon and an inline error, used across the checkout form.
const InputField = React.memo(function InputField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  icon: Icon,
  placeholder,
  type = "text",
  inputMode,
}) {
  const invalid = touched && error;
  return (
    <div className="mb-3 sm:mb-5">
      <label
        htmlFor={name}
        className="block text-[10px] sm:text-xs font-bold text-[#777168] uppercase tracking-wider mb-1 sm:mb-1.5 ml-0.5"
      >
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {Icon && (
            <Icon
              className={`text-sm sm:text-base transition-colors ${invalid ? "text-alert" : "text-muted-light group-focus-within:text-[#a85d37]"}`}
            />
          )}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-xl border-0 bg-white h-10 sm:h-11 py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm font-semibold text-[#1d1c19] shadow-xs ring-1 ring-inset transition-all placeholder:text-muted-light focus:ring-2 ${
            invalid
              ? "ring-alert/30 focus:ring-alert bg-alert/10"
              : "ring-black/[0.08] focus:ring-[#a85d37]/40 hover:ring-black/15"
          }`}
        />
      </div>
      {invalid && (
        <p className="mt-1 ml-0.5 text-[10px] sm:text-xs font-bold text-alert flex items-center gap-1 animate-fade-up-quick">
          <span className="inline-block w-1 h-1 rounded-full bg-alert" /> {error}
        </p>
      )}
    </div>
  );
});

export default InputField;
