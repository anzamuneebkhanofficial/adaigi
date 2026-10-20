export function rupeesToPaisa(rupees) {
  return Math.round(Number(rupees) * 100);
}

export function paisaToRupees(paisa) {
  return (Number(paisa) / 100).toFixed(2);
}

export function formatRupees(paisa) {
  const num = Number(paisa) / 100;
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
