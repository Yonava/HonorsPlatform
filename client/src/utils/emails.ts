
type FirstName<T extends string> = T extends `${infer F} ${infer _}` ? F : T;
type FirstInitial<T extends string> = T extends `${infer F}${infer _}` ? F : T;
type LastName<T extends string> = T extends `${infer _} ${infer L}` ? LastName<L> : T;

export type StudentEmail<T extends string = string> = ReturnType<typeof getStudentEmail<T>>;
export type FacultyEmail<T extends string = string> = ReturnType<typeof getFacultyEmail<T>>;

export function emailValidator(email: string) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return email.trim() ? pattern.test(email) : true
}

export function emailInputValidator() {
  return [(v: string) => emailValidator(v) || 'Invalid Email']
}

export function phoneValidator(phone: string) {
  const pattern = /^(\+?1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/
  return phone.trim() ? pattern.test(phone) : true
}

export function phoneInputValidator() {
  return [(v: string) => phoneValidator(v) || 'Invalid Phone Number']
}

function sanitizeName<T extends string>(name: T) {
  const fullName = name.split(' ').map(n => n.toLowerCase());
  const firstName = fullName.at(0);
  const lastName = fullName.at(-1);
  return [firstName, lastName];
}

export function getStudentEmail<
  T extends string,
  F extends FirstName<T> = FirstName<T>,
  L extends LastName<T> = LastName<T>
>(name: T) {
  const [first, last] = sanitizeName(name) as [Lowercase<F>, Lowercase<L>];
  return `${first}.${last}@snhu.edu` as const;
}

export function getFacultyEmail<
  T extends string,
  F extends FirstName<T> = FirstName<T>,
  L extends LastName<T> = LastName<T>
>(name: T) {
  const [first, last] = sanitizeName(name) as [Lowercase<F>, Lowercase<L>];
  const firstInitial = first[0] as FirstInitial<typeof first>;
  return `${firstInitial}.${last}@snhu.edu` as const;
}

export function sendEmail(email: string) {
  window.open(`mailto:${email}`)
}