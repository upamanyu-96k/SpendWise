export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const toInputDate = (d) => new Date(d).toISOString().slice(0, 10);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const monthLabel = (m) => {
  const [y, mo] = m.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString('en-IN', { month: 'short', year: '2-digit', timeZone: 'UTC' });
};
