import { instructorCache } from './DataMappers'

export function instructorAutoComplete(instructorInput: string) {
  const instructorList = [...instructorCache]
  const instructorSuggestions = instructorList.filter(instructor => {
    return instructor.toLowerCase().startsWith(instructorInput.toLowerCase())
  })
  
  if (instructorSuggestions.length === 0) {
    return false
  } else {
    return instructorSuggestions[0]
  }
}