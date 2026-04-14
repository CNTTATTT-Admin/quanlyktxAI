export function formatVnd(amount) {
  const numericValue = Number(amount);

  if (!Number.isFinite(numericValue)) {
    return "0 VNĐ";
  }

  return `${numericValue.toLocaleString("vi-VN")} VNĐ`;
}
