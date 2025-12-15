"use client";

import { useState, useRef, useEffect } from "react";

interface Country {
  id: number;
  name: string;
  short_code?: string;
  country_code?: number | string;
}

interface CountrySelectorProps {
  value: string;
  onChange: (countryId: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  countries: Country[];
  placeholder?: string;
  className?: string;
}

export default function CountrySelector({
  value,
  onChange,
  onFocus,
  onBlur,
  countries,
  placeholder = "Select country...",
  className = "",
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry =
    countries.find((c) => c.id.toString() === value) || null;

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.short_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
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
      document.addEventListener("touchstart", handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (countryId: string) => {
    onChange(countryId);
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
        onBlur={(e) => {
          // Don't blur if clicking inside dropdown
          if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
            onBlur?.();
          }
        }}
        className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-gray-200 transition-all duration-200 rounded-xl hover:border-gray-400 cursor-pointer font-medium text-left flex items-center justify-between gap-2"
      >
        <span className={selectedCountry ? "text-black" : "text-gray-500"}>
          {selectedCountry ? selectedCountry.name : placeholder}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ${
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
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-2 focus:ring-gray-200 text-sm text-black"
              onKeyDown={(e) => {
                // Close on Escape
                if (e.key === "Escape") {
                  setIsOpen(false);
                  setSearchTerm("");
                }
              }}
            />
          </div>

          {/* Countries list */}
          <div className="overflow-y-auto max-h-64 overscroll-contain">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => handleSelect(country.id.toString())}
                  onMouseDown={(e) => {
                    // Prevent blur event from firing before click
                    e.preventDefault();
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left ${
                    value === country.id.toString()
                      ? "bg-gray-50 font-semibold"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-black truncate">
                      {country.name}
                    </div>
                    {country.short_code && (
                      <div className="text-xs text-gray-500">
                        {country.short_code}
                      </div>
                    )}
                  </div>
                  {value === country.id.toString() && (
                    <svg
                      className="w-5 h-5 text-black flex-shrink-0"
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
















