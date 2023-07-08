import { useDocumentCache } from "./store/useDocumentCache"

export function useInstructorAutoComplete() {

  const instructorList: string[] = [];

  const init = () => {
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

  const getSuggestedInstructor = (input: string) => {
    for (const instructor of instructorList) {
      if (instructor.toLowerCase().startsWith(input.toLowerCase())) {
        return instructor
      } else if (instructor.toLowerCase().includes(input.toLowerCase())) {
        return instructor
      }
    }
    return false
  }

  init()

  return {
    getSuggestedInstructor,
    init
  }
}