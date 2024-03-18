export function filterItems<T extends Object>(arrayOfObjects: T[], searchFilter: string) {
  if (!searchFilter) {
    return arrayOfObjects;
  }
  return arrayOfObjects.filter(item => {
    const query = searchFilter.toLowerCase();
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(query)
  })
}