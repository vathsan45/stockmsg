// ==============================================================================
// INDIAN STOCK MARKET HOLIDAYS & TRADING DAY VALIDATOR
// ==============================================================================

// Official Indian Stock Market (NSE/BSE) standard trading holidays calendar
export const NSE_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-26': 'Republic Day',
  '2026-03-03': 'Holi',
  '2026-03-27': 'Shri Ram Navami',
  '2026-03-31': 'Id-Ul-Fitr (Ramzan Id)',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Dr. Baba Saheb Ambedkar Jayanti',
  '2026-05-01': 'Maharashtra Day',
  '2026-06-07': 'Bakri Id / Eid ul-Adha',
  '2026-08-15': 'Independence Day',
  '2026-09-16': 'Ganesh Chaturthi',
  '2026-10-02': 'Mahatma Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-08': 'Diwali Laxmi Pujan',
  '2026-11-09': 'Diwali Balipratipada',
  '2026-11-24': 'Guru Nanak Jayanti',
  '2026-12-25': 'Christmas',
};

/**
 * Checks if a given YYYY-MM-DD date is a valid Indian Stock Market trading day.
 * Returns { isTradingDay: boolean, reason?: string }
 */
export function checkTradingDayStatus(dateStr: string): { isTradingDay: boolean; reason?: string } {
  const date = new Date(dateStr);

  // 1. Weekend check (Sunday = 0, Saturday = 6)
  const dayOfWeek = date.getUTCDay();
  if (dayOfWeek === 0) {
    return { isTradingDay: false, reason: 'Sunday - Indian Stock Market is closed on weekends.' };
  }
  if (dayOfWeek === 6) {
    return { isTradingDay: false, reason: 'Saturday - Indian Stock Market is closed on weekends.' };
  }

  // 2. NSE Holiday check
  if (NSE_HOLIDAYS_2026[dateStr]) {
    return {
      isTradingDay: false,
      reason: `NSE Market Holiday: ${NSE_HOLIDAYS_2026[dateStr]}`,
    };
  }

  return { isTradingDay: true };
}

/**
 * Formats a Date object to YYYY-MM-DD in Asia/Kolkata timezone.
 */
export function getIndianTradingDateStr(date: Date = new Date()): string {
  // Convert date to IST (Asia/Kolkata) string format YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}
