import { instructorCache } from './DataMappers'
import { ref } from 'vue'

export function useInstructorAutoComplete() {
  
  const placeholder = ref('')

  function completeInstructor(instructor: string) {
    if (instructorCache.includes(instructor)) {
      placeholder.value = instructor
    }
  }

  return {
    placeholder,
    completeInstructor
  }
}