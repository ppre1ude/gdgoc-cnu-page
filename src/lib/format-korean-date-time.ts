const kstOffsetMs = 9 * 60 * 60 * 1000;

export function formatKoreanDate(value: string) {
  const kstDate = new Date(new Date(value).getTime() + kstOffsetMs);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const day = kstDate.getUTCDate();

  return `${year}. ${month}. ${day}.`;
}

export function formatKoreanDateTime(value: string) {
  const kstDate = new Date(new Date(value).getTime() + kstOffsetMs);
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const day = kstDate.getUTCDate();
  const hour = kstDate.getUTCHours();
  const minute = String(kstDate.getUTCMinutes()).padStart(2, '0');
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${year}. ${month}. ${day}. ${period} ${hour12}:${minute}`;
}
