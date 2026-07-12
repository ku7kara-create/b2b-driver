"use client";

import React, { useState } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: string;
  dir?: "rtl" | "ltr";
}

export function InputField({ label, icon, dir = "rtl", className = "", ...props }: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-on-surface-variant px-1">
        {label}
      </label>
      <div
        className={`relative flex items-center border rounded-lg bg-surface-container-low transition-all duration-200 ${
          focused
            ? "border-primary shadow-[0_0_0_2px_rgba(9,20,38,0.2)]"
            : "border-outline-variant"
        }`}
      >
        {icon && (
          <span
            className={`material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-outline ${
              focused ? "text-secondary-container" : ""
            } ${dir === "rtl" ? "right-3" : "left-3"}`}
          >
            {icon}
          </span>
        )}
        <input
          className={`w-full h-12 px-3 bg-transparent border-none focus:ring-0 text-base text-on-surface placeholder:text-on-surface-variant/50 ${
            icon ? "pr-10" : ""
          } ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
}

export function PasswordField({ label, name, placeholder = "••••••••" }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-on-surface-variant px-1" htmlFor={name}>
        {label}
      </label>
      <div
        className={`relative flex items-center border rounded-lg bg-surface-container-low transition-all duration-200 ${
          focused
            ? "border-primary shadow-[0_0_0_2px_rgba(9,20,38,0.2)]"
            : "border-outline-variant"
        }`}
      >
        <span
          className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline ${
            focused ? "text-secondary-container" : ""
          }`}
        >
          lock
        </span>
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          className="w-full h-12 pr-10 pl-3 bg-transparent border-none focus:ring-0 text-base text-on-surface placeholder:text-on-surface-variant/50 text-left"
          dir="ltr"
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="px-3 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
    </div>
  );
}

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-on-surface-variant px-1">
        رقم الهاتف
      </label>
      <div
        className={`relative flex items-center border rounded-lg bg-surface-container-low transition-all duration-200 ${
          focused
            ? "border-primary shadow-[0_0_0_2px_rgba(9,20,38,0.2)]"
            : "border-outline-variant"
        }`}
        dir="ltr"
      >
        <div className="flex items-center gap-1 px-3 border-r border-outline-variant h-12 shrink-0">
          <span className="text-sm font-medium text-primary">+966</span>
        </div>
        <input
          type="tel"
          className="w-full h-12 px-3 bg-transparent border-none focus:ring-0 text-base text-on-surface text-left placeholder:text-on-surface-variant/50"
          placeholder="5xxxxxxxx"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  );
}

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  icon?: string;
}

export function SubmitButton({ children, loading, success, icon }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full h-14 rounded-lg font-bold text-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
        success
          ? "bg-green-600 text-white"
          : "bg-secondary-container text-white hover:brightness-110"
      } ${loading ? "opacity-80 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined animate-spin">sync</span>
          جاري المعالجة...
        </>
      ) : success ? (
        <>
          <span className="material-symbols-outlined">check_circle</span>
          تم بنجاح
        </>
      ) : (
        <>
          <span>{children}</span>
          {icon && <span className="material-symbols-outlined">{icon}</span>}
        </>
      )}
    </button>
  );
}
