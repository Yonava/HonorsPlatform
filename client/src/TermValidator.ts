/*
  the first 2 numbers should be the year
  the following 5 characters are the season identifier
  the total length should be 7 characters
*/
export function termValidator(term: string) {
  const seasonIdentifiers = [
    'SPDAY',
    'FADAY',
    'WIRPT',
    'SURPT',
    'FARPT',
    'EW1',
    'EW2',
    'EW3',
    'EW4',
    'EW5',
  ]

  if (term.length < 2) {
    return false;
  }

  const year = parseInt(term.slice(0, 2));
  const season = term.slice(2, term.length).toUpperCase();

  const currentYear = new Date().getFullYear() - 2000;
  const yearDifference = currentYear - year;

  if (!seasonIdentifiers.includes(season)) {
    return false;
  }

  if (isNaN(year)) {
    return false;
  }

  if (Math.abs(yearDifference) > 2) {
    return false;
  }

  return true;
}