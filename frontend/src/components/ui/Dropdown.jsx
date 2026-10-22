import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  items = [],
  align = 'right', // right | left
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black/5 border border-slate-200/80 divide-y divide-slate-100 z-50 animate-fade-in focus:outline-none`}
        >
          <div className="py-1">
            {items.map((item, idx) => {
              if (item.divider) {
                return <div key={idx} className="border-t border-slate-100 my-1" />;
              }
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                  className={`group flex w-full items-center px-4 py-2 text-xs font-medium text-left transition-colors duration-150 cursor-pointer
                    ${item.danger 
                      ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                    }`}
                >
                  {Icon && (
                    <Icon className={`mr-2.5 h-4 w-4 ${item.danger ? 'text-red-500' : 'text-slate-400 group-hover:text-blue-600'}`} />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
