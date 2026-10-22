export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    if (options.relative) {
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
    }

    if (options.short) {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const addDays = (dateString, days) => {
  const date = new Date(dateString || new Date());
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};
