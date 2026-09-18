/**
 * Portuguese working-day deadline calculation for SIBA (3 dias úteis).
 * Skips Saturdays, Sundays, and fixed Portuguese public holidays.
 */

/** Fixed Portuguese public holidays (month-day, no year). */
const PT_FIXED_HOLIDAYS: Array<[number, number]> = [
  [1, 1], // Ano Novo
  [4, 25], // Dia da Liberdade
  [5, 1], // Dia do Trabalhador
  [6, 10], // Dia de Portugal
  [8, 15], // Assunção de Nossa Senhora
  [10, 5], // Implantação da República
  [11, 1], // Todos os Santos
  [12, 1], // Restauração da Independência
  [12, 8], // Imaculada Conceição
  [12, 25], // Natal
];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isPtFixedHoliday(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return PT_FIXED_HOLIDAYS.some(([m, d]) => m === month && d === day);
}

export function isPortugueseWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isPtFixedHoliday(date);
}

/** Add N Portuguese working days to a date (exclusive of start; deadline is end of resulting day). */
export function addPortugueseWorkingDays(startDate: Date, workingDays: number): Date {
  const result = new Date(startDate);
  result.setHours(23, 59, 59, 999);
  let added = 0;

  while (added < workingDays) {
    result.setDate(result.getDate() + 1);
    if (isPortugueseWorkingDay(result)) {
      added++;
    }
  }

  return result;
}

export const SIBA_WORKING_DAYS_DEADLINE = 3;

export function getSibaDeadline(eventDate: Date): Date {
  return addPortugueseWorkingDays(eventDate, SIBA_WORKING_DAYS_DEADLINE);
}

export function getWorkingDaysRemaining(deadline: Date, now: Date = new Date()): number {
  if (now.getTime() >= deadline.getTime()) return 0;

  let count = 0;
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);

  while (cursor.getTime() < end.getTime()) {
    cursor.setDate(cursor.getDate() + 1);
    if (isPortugueseWorkingDay(cursor)) {
      count++;
    }
  }

  return count;
}
