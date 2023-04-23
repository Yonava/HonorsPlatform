import { instructorCache } from './DataMappers'

export function instructorAutoComplete(instructorInput: string) {
  const instructorList = [...instructorCache]
  for (const i in instructorList) {
    if (instructorList[i].toLowerCase().startsWith(instructorInput.toLowerCase())) {
      return instructorList[i]
    } else if (instructorList[i].toLowerCase().includes(instructorInput.toLowerCase())) {
      return instructorList[i]
    }
  }
  return false
}