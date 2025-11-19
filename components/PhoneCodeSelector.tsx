"use client";

import { useState, useRef, useEffect } from "react";

interface Country {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: "971", name: "UAE", flag: "🇦🇪" },
  { code: "1", name: "US/CA", flag: "🇺🇸" },
  { code: "44", name: "UK", flag: "🇬🇧" },
  { code: "33", name: "France", flag: "🇫🇷" },
  { code: "49", name: "Germany", flag: "🇩🇪" },
  { code: "39", name: "Italy", flag: "🇮🇹" },
  { code: "34", name: "Spain", flag: "🇪🇸" },
  { code: "31", name: "Netherlands", flag: "🇳🇱" },
  { code: "32", name: "Belgium", flag: "🇧🇪" },
  { code: "41", name: "Switzerland", flag: "🇨🇭" },
  { code: "43", name: "Austria", flag: "🇦🇹" },
  { code: "46", name: "Sweden", flag: "🇸🇪" },
  { code: "47", name: "Norway", flag: "🇳🇴" },
  { code: "45", name: "Denmark", flag: "🇩🇰" },
  { code: "358", name: "Finland", flag: "🇫🇮" },
  { code: "7", name: "Russia", flag: "🇷🇺" },
  { code: "81", name: "Japan", flag: "🇯🇵" },
  { code: "82", name: "South Korea", flag: "🇰🇷" },
  { code: "86", name: "China", flag: "🇨🇳" },
  { code: "91", name: "India", flag: "🇮🇳" },
  { code: "65", name: "Singapore", flag: "🇸🇬" },
  { code: "60", name: "Malaysia", flag: "🇲🇾" },
  { code: "66", name: "Thailand", flag: "🇹🇭" },
  { code: "61", name: "Australia", flag: "🇦🇺" },
  { code: "64", name: "New Zealand", flag: "🇳🇿" },
  { code: "27", name: "South Africa", flag: "🇿🇦" },
  { code: "55", name: "Brazil", flag: "🇧🇷" },
  { code: "52", name: "Mexico", flag: "🇲🇽" },
  { code: "54", name: "Argentina", flag: "🇦🇷" },
  { code: "90", name: "Turkey", flag: "🇹🇷" },
  { code: "20", name: "Egypt", flag: "🇪🇬" },
  { code: "966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "974", name: "Qatar", flag: "🇶🇦" },
  { code: "965", name: "Kuwait", flag: "🇰🇼" },
  { code: "973", name: "Bahrain", flag: "🇧🇭" },
  { code: "968", name: "Oman", flag: "🇴🇲" },
  { code: "961", name: "Lebanon", flag: "🇱🇧" },
  { code: "962", name: "Jordan", flag: "🇯🇴" },
];

interface PhoneCodeSelectorProps {
  value: string;
  onChange: (code: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export default function PhoneCodeSelector({
  value,
  onChange,
  onFocus,
  onBlur,
  className = "",
}: PhoneCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm) ||
      `+${country.code}`.includes(searchTerm)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          onFocus?.();
        }}
        onBlur={onBlur}
        className="w-full px-3 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 cursor-pointer font-medium text-sm flex items-center justify-between gap-2 min-w-[120px]"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="font-semibold">+{selectedCountry.code}</span>
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200 text-sm"
              autoFocus
            />
          </div>

          {/* Countries list */}
          <div className="overflow-y-auto max-h-64">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left ${
                    value === country.code ? "bg-gray-50 font-semibold" : ""
                  }`}
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-black">{country.name}</div>
                    <div className="text-xs text-gray-500">+{country.code}</div>
                  </div>
                  {value === country.code && (
                    <svg
                      className="w-5 h-5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
