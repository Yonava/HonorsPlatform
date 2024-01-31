import { toRef, computed } from "vue"
import type { MaybeRefOrGetter } from "vue"
import { useDocumentCache } from "@store/useDocumentCache"
import type { IncludeByProp, SheetItemKeys } from "@apptypes/sheetItems"
import { getCurrentTerm } from "@utils/terms"

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

export type AutoCompleteButton<T> = {
  condition: boolean,
  newPropValue: () => T,
  text: T
}

type UseAutoCompleteOptions<T> = {
  source: T[],
  userInput?: MaybeRefOrGetter<string>,
  btnOverrideFn?: (input: string | undefined, suggestedValues: T[]) => Readonly<Partial<AutoCompleteButton<T>>>
}

export function useAutoComplete<T>(options: UseAutoCompleteOptions<T>) {

  const { source, userInput, btnOverrideFn } = options

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

  const button = computed(() => {
    const args = [input.value, suggestedValues.value] as const
    return Object.assign(autoCompleteButton(...args), btnOverrideFn?.(...args))
  })

  return {
    button,
    suggestedValues,
    possibleValues,
    input,
  } as const
}

export const useInstructorAutoComplete = (item: IncludeByProp<'instructor' | 'mentor'>) => {
  const instructors = getAllItemsWithProperty("instructor").map(item => item.instructor)
  const mentors = getAllItemsWithProperty("mentor").map(item => item.mentor)
  const inputSrc = computed(() => 'instructor' in item ? item.instructor : item.mentor)

  return useAutoComplete({
    source: [...instructors, ...mentors],
    userInput: inputSrc,
  })
}

export const useTermCodeAutoComplete = (item: IncludeByProp<'term'>) => {
  const userEnteredTerms = getAllItemsWithProperty('term').map(item => item.term)
  const inputSrc = computed(() => item.term)

  const currentTerm = getCurrentTerm()
  return useAutoComplete({
    source: userEnteredTerms,
    userInput: inputSrc,
    btnOverrideFn: (input, [suggested]) => ({
      newPropValue: () => input?.trim() ? suggested : currentTerm,
      text: input?.trim() ? suggested : currentTerm,
    })
  })
}

export const dateAutoComplete = (inputSrc: any, prompt = 'Today') => {
  return {
    condition: !inputSrc.toString().trim(),
    newPropValue: () => new Date().toLocaleDateString('en-US'),
    text: prompt,
  } as const
}