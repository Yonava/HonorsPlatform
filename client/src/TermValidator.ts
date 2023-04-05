/*
  the first 2 numbers should be the year
  the following 5 characters are the season identifier
  the total length should be 7 characters
*/
export function termValidator(term: string) {
  const seasonIdentifiers = [
    'SPDAY',
    'FADAY'
  ]

  const year = parseInt(term.slice(0, 2));
  const season = term.slice(2, 7);
  
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