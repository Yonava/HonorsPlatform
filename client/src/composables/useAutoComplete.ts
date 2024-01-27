import { toRef, computed } from "vue"
import type { MaybeRefOrGetter, Ref } from "vue"
import { useDocumentCache } from "@store/useDocumentCache"
import type { IncludeByProp, SheetItemKeys } from "@apptypes/sheetItems"

const getAllItemsWithProperty = <T extends SheetItemKeys>(prop: T) => {
  const { allSheetItems: items } = useDocumentCache()
  return items.filter((item) => {
    return prop in item
  }) as IncludeByProp<T>[]
}

const autoCompleteButton = <T>(input: string | undefined, suggestedValues: T[]) => {
  const suggestion = suggestedValues[0]
  const showButton = suggestion && input !== suggestion
  return {
    condition: showButton,
    newPropValue: () => suggestion,
    text: suggestion,
  } as const
}

export function useAutoComplete<T>(
  source: T[],
  userInput?: MaybeRefOrGetter<string>,
) {
  const possibleValues = [
    ...new Set(source.filter((value) => !!value?.toString().trim()))
  ]
  const input = toRef(userInput)

  const suggestedValues = computed(() => {
    const str = (v: any) => v?.toString().toLowerCase() || ""
    const inputString = str(input.value)

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

  const button = computed(() => autoCompleteButton(input.value, suggestedValues.value))

  return {
    button,
    suggestedValues,
    possibleValues,
    input,
  } as const
}

export const useInstructorAutoComplete = <T extends string>(inputSrc: Ref<T>) => {
  const instructors = getAllItemsWithProperty("instructor").map(item => item.instructor)
  const mentors = getAllItemsWithProperty("mentor").map(item => item.mentor)
  return useAutoComplete([...instructors, ...mentors], inputSrc)
}