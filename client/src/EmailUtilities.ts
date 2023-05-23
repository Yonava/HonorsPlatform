/*
  This file contains utility functions for
  generating and validating SNHU email addresses.
*/
export function emailValidator(email: string) {
  if (email === "") return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function phoneValidator(phone: string) {
  if (phone === "") return true;
  return /^(\+?1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

function sanitizeName(name: string) {
  const fullName = name.split(' ').map(name => name.trim().toLowerCase());

  const firstName = fullName[0];
  const lastName = fullName[fullName.length - 1];

  return [firstName, lastName];
}

export function getStudentEmail(name: string) {
  const [firstName, lastName] = sanitizeName(name);
  if (!(firstName && lastName)) return '';
  return `${firstName}.${lastName}@snhu.edu`;
}

export function getFacultyEmail(name: string) {
  const [firstName, lastName] = sanitizeName(name);
  if (!(firstName && lastName)) return '';
  return `${firstName[0]}.${lastName}@snhu.edu`;
}

export function sendEmail(email: string) {
  window.open(`mailto:${email}`)
}
