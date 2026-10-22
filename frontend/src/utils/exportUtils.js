export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerPrint = () => {
  window.print();
};
