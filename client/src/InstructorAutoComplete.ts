import { ref, watch, computed } from "vue"
import type { Ref } from "vue"
import { useDocumentCache } from "@store/useDocumentCache"
import type { IncludeByProp, SheetItemKeys } from "@apptypes/sheetItems"

const getAllItemsWithProperty = <T extends SheetItemKeys>(prop: T) => {
  const { allSheetItems: items } = useDocumentCache()
  return items.filter((item) => {
    return prop in item
  }) as IncludeByProp<T>[]
}

export function useAutoComplete<T extends SheetItemKeys>(props: T | T[]) {
  const propArr = Array.isArray(props) ? props : [props]
  const sysIds = new Set<string>()
  for (const prop of propArr) {
    const res = getAllItemsWithProperty(prop)
    const itemSysIds = res.map((item) => item.sysId)
    for (const sysId of itemSysIds) sysIds.add(sysId)
  }

  const { getItemBySysId } = useDocumentCache()
  return [...sysIds].map((sysId) => getItemBySysId(sysId)) as IncludeByProp<T[][number]>[]
}

const complete = useAutoComplete(['mentor', 'instructor'])


export function useInstructorAutoComplete(instructor: Ref<string>) {

  const instructorList = ref<string[]>([])
  const searchableInstructorList = ref<string[]>([])

  const computeInstructors = () => {
    const {
      Modules,
      "Completed Modules": CompletedModules,
      Theses
    } = useDocumentCache()

    for (const module of Modules.list) {
      if (module.instructor) {
        instructorList.value.push(module.instructor)
      }
    }

    for (const module of CompletedModules.list) {
      if (module.instructor) {
        instructorList.value.push(module.instructor)
      }
    }

    for (const thesis of Theses.list) {
      if (thesis.mentor) {
        instructorList.value.push(thesis.mentor)
      }
    }

    searchableInstructorList.value = [...instructorList.value].map(instructor => instructor.trim().toLowerCase())
  }

  // false if no suggestion, else the suggested instructor
  const suggestedInstructor = computed(() => {

    const passedInstructor = instructor.value.trim().toLowerCase()

    for (const i in searchableInstructorList.value) {

      // prioritize startsWith
      if (searchableInstructorList.value[i].startsWith(passedInstructor)) {
        return instructorList.value[i]
      }
    }

    for (const i in searchableInstructorList.value) {

      // fallback to includes
      if (searchableInstructorList.value[i].includes(passedInstructor)) {
        return instructorList.value[i]
      }
    }

    return false
  })

  const sameInstructor = computed(() => {
    if (!suggestedInstructor.value) {
      return false
    }
    return suggestedInstructor.value?.trim().toLowerCase() === instructor.value.trim().toLowerCase()
  })

  computeInstructors()

  const suggestionSelected = ref(!!instructor.value)
  const selectSuggestion = () => {
    suggestionSelected.value = true
    return suggestedInstructor.value
  }

  watch(instructor, (newInput, oldInput) => {
    suggestionSelected.value = false
    const newLength = newInput?.length || 0
    const oldLength = oldInput?.length || 0
    const distance = Math.abs(newLength - oldLength)
    if (distance > 1) {
      computeInstructors()
    }
  })

  const suggestionToString = computed(() => {
    if (!suggestedInstructor.value) {
      return 'No Suggestions'
    }

    return suggestedInstructor.value
  })

  return {
    sameInstructor,
    selectSuggestion,
    suggestionSelected,
    suggestedInstructor,
    instructorList,
    computeInstructors,
    suggestionToString
  }
}
