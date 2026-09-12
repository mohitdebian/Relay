'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export function FilterDropdown({ label, value, onChange, options }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <div className="filter-chip" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {value === 'all' ? label : selectedOption?.label} <span className="chev">▾</span>
      </div>

      {isOpen && (
        <div
          className="cd-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            width: 'max-content',
            minWidth: '150px',
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                className={`cd-option ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="cd-option-label">{option.label}</span>
                {isSelected && <span className="cd-checkmark">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
