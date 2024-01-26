import { ref, toRef, watch, computed } from "vue"
import type { MaybeRefOrGetter, Ref } from "vue"
import { useDocumentCache } from "@store/useDocumentCache"
import type { IncludeByProp, SheetItemKeys, JointSheetItem } from "@apptypes/sheetItems"

const getAllItemsWithProperty = <T extends SheetItemKeys>(prop: T) => {
  const { allSheetItems: items } = useDocumentCache()
  return items.filter((item) => {
    return prop in item
  }) as IncludeByProp<T, JointSheetItem>[]
}

export function useAutoComplete<T extends JointSheetItem[K], K extends SheetItemKeys>(
  propSource: K,
  userInput?: MaybeRefOrGetter<T>,
) {
  const items = getAllItemsWithProperty(propSource)
  const possibleValues = [...new Set(items.map((item) => item[propSource]))]
  const input = toRef(userInput)

  const suggestedValues = computed(() => {
    const inputString = input.value?.toString().toLowerCase() || ""
    const str = (v: any) => v?.toString().toLowerCase() || ""

    const doesInclude = (v: any) => str(v).includes(inputString)
    const prioritizeStartsWith = (a: any, b: any) => {
      const aString = str(a)
      const bString = str(b)
      const startsWithA = aString.startsWith(inputString) ? 1 : 0
      const startsWithB = bString.startsWith(inputString) ? 1 : 0
      return startsWithB - startsWithA
    }

    return possibleValues
      .filter(doesInclude)
      .sort(prioritizeStartsWith)
  })

  return {
    suggestedValues,
    possibleValues,
    input
  }
}

export const useInstructorAutoComplete_v2 = <T extends JointSheetItem['instructor']>(inputSrc: Ref<T>) => {
  const autoComplete = useAutoComplete("instructor", inputSrc)
  const suggestion = computed(() => autoComplete.suggestedValues.value[0])
  const suggestionAvailable = computed(() => autoComplete.suggestedValues.value.length > 0)
  const showButton = computed(() => suggestionAvailable.value && inputSrc.value !== suggestion.value)
  return {
    autoComplete,
    button: computed(() => ({
      condition: showButton.value,
      newPropValue: () => suggestion.value,
      text: suggestion.value,
    }))
  }
}

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
