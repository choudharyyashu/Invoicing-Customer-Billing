import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      <table className={`w-full text-left text-sm text-slate-600 border-collapse ${className}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <thead className={`bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 ${className}`}>
      {children}
    </thead>
  );
};

export const TableHeader = ({ children, className = '', align = 'left' }) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th scope="col" className={`px-4 py-3.5 whitespace-nowrap ${alignClass} ${className}`}>
      {children}
    </th>
  );
};

export const TableBody = ({ children, className = '' }) => {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>;
};

export const TableRow = ({ children, className = '', hover = true, onClick }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${hover ? 'hover:bg-slate-50/70' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '', align = 'left' }) => {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <td className={`px-4 py-3.5 text-sm ${alignClass} ${className}`}>
      {children}
    </td>
  );
};
