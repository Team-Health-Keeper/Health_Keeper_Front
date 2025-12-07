// 커뮤니티 관련 유틸 함수 모음

export function parseFoundedDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const direct = new Date(dateStr);
  if (!isNaN(direct.getTime())) return direct;
  const digits = (dateStr.match(/\d/g) || []).join("");
  if (digits.length >= 4) {
    const y = Number(digits.slice(0, 4));
    const m = digits.length >= 6 ? Number(digits.slice(4, 6)) : 1;
    const d = digits.length >= 8 ? Number(digits.slice(6, 8)) : 1;
    const dt = new Date(y, Math.max(0, m - 1), Math.max(1, d));
    if (!isNaN(dt.getTime())) return dt;
  }
  return null;
}

export function yearsOfOperation(dateStr: string): string {
  const founded = parseFoundedDate(dateStr);
  if (!founded) return "-";
  const today = new Date();
  let years = today.getFullYear() - founded.getFullYear();
  const beforeAnniversary =
    today.getMonth() < founded.getMonth() ||
    (today.getMonth() === founded.getMonth() && today.getDate() < founded.getDate());
  if (beforeAnniversary) years -= 1;
  return years < 0 ? "-" : `${years}년차`;
}

export function formatMemberCount(val: number | string): string {
  const num = typeof val === "string" ? Number(val) : val;
  if (isNaN(num)) return "-";
  return num.toLocaleString();
}
