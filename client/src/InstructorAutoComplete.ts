import { useDocumentCache } from "./store/useDocumentCache"
import { type Ref, watch, computed } from "vue"

export function useInstructorAutoComplete(instructor: Ref<string | null>) {

  const instructorList: string[] = [];

  const computeInstructors = () => {
    const {
      Modules,
      "Completed Modules": CompletedModules,
      Theses
    } = useDocumentCache()

    for (const module of Modules.list) {
      if (module.instructor) {
        instructorList.push(module.instructor)
      }
    }

    for (const module of CompletedModules.list) {
      if (module.instructor) {
        instructorList.push(module.instructor)
      }
    }

    for (const thesis of Theses.list) {
      if (thesis.mentor) {
        instructorList.push(thesis.mentor)
      }
    }
  }

  // false if no suggestion, else the suggested instructor
  const suggestedInstructor = computed(() => {

    if (!instructor.value) {
      return false
    }

    for (const suggestedInstructor of instructorList) {

      // prioritize startsWith
      if (suggestedInstructor.toLowerCase().startsWith(instructor.value.toLowerCase())) {
        return suggestedInstructor
      }
    }

    for (const suggestedInstructor of instructorList) {

      // fallback to includes
      if (suggestedInstructor.toLowerCase().includes(instructor.value.toLowerCase())) {
        return suggestedInstructor
      }
    }

    return false
  })

  watch(instructor, (newInput, oldInput) => {
    console.log('newInput', newInput)
    const newLength = newInput?.length || 0
    const oldLength = oldInput?.length || 0
    const distance = Math.abs(newLength - oldLength)
    if (distance > 1) {
      computeInstructors()
    }
  })

  computeInstructors()

  return {
    suggestedInstructor,
    computeInstructors
  }
}