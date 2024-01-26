import { toRef, computed } from "vue"
import type { MaybeRefOrGetter, Ref } from "vue"
import { useDocumentCache } from "@store/useDocumentCache"
import type { IncludeByProp, SheetItemKeys, JointSheetItem } from "@apptypes/sheetItems"

const getAllItemsWithProperty = <T extends SheetItemKeys>(prop: T) => {
  const { allSheetItems: items } = useDocumentCache()
  return items.filter((item) => {
    return prop in item
  }) as IncludeByProp<T, JointSheetItem>[]
}

export function useAutoComplete<T extends string, K extends SheetItemKeys>(
  propSource: K,
  userInput?: MaybeRefOrGetter<T>,
) {
  const items = getAllItemsWithProperty(propSource)
  const possibleValues = [
    ...new Set(
      items
        .map((item) => item[propSource])
        .filter((value) => !!value?.toString().trim())
    )
  ]
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

export const useInstructorAutoComplete = <T extends string>(inputSrc: Ref<T>) => {
  const autoComplete = useAutoComplete("instructor", inputSrc)
  const suggestion = computed(() => autoComplete.suggestedValues.value[0])
  const suggestionAvailable = computed(() => autoComplete.suggestedValues.value.length > 0)
  const showButton = computed(() => suggestionAvailable.value && inputSrc.value !== suggestion.value)
  return {
    autoComplete,
    button: computed(() => ({
      condition: showButton.value || !inputSrc.value,
      newPropValue: () => suggestion.value,
      text: suggestion.value,
    }))
  }
}