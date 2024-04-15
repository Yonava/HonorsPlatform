import { computed, toRef } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

/*
  the first 2 numbers should be the year
  the following characters contain the season identifier
*/
export function termValidator(term: string) {

  if (term.length === 0) return true;

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

  else if (isNaN(year)) {
    return false;
  }

  else if (Math.abs(yearDifference) > 2) {
    return false;
  }

  return true;
}

export function termInputValidator() {
  return [(v: string) => termValidator(v) || 'Potentially Invalid Term']
}

export function getTerm(date: Date) {
  const year = date.getFullYear() - 2000;
  const month = date.getMonth();

  let seasonIdentifier = month < 7 ? 'SPDAY' : 'FADAY';
  return `${year}${seasonIdentifier}`;
}

export function getCurrentTerm() {
  return getTerm(new Date());
}

export function useTerm(termInput: MaybeRefOrGetter<string>) {
  const term = toRef(termInput);
  return computed(() => getTerm(new Date(term.value)));
}