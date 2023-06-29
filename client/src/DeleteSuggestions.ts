import { Panel, getPanel } from "./Panels";
import { useSheetManager } from './store/useSheetManager'
import { useDocumentCache } from "./store/useDocumentCache";
import { useDialog } from "./store/useDialog";
import {
  SheetItem,
  Student,
  Module,
  CompletedModule,
  Thesis,
  GradEngagement,
  Graduate
} from "./SheetTypes";

type Deletion<T extends SheetItem> = {
  flaggedBecause: string[]
  status: null | "danger" | "warn" | "success",
  item: T,
}

export type DeletionOutput<T extends SheetItem> = {
  rationale: string,
  status: null | "danger" | "warn" | "success",
  item: T
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const deletionToDeletionOutput = <T extends SheetItem>(deletion: Deletion<T>) => {
  return {
    rationale: capitalize(rationaleToString(deletion.flaggedBecause)),
    status: deletion.status,
    item: deletion.item
  }
}

const sortItems = (a: DeletionOutput<SheetItem>, b: DeletionOutput<SheetItem>) => {
  const [tieBreakerA, tieBreakerB] = [Object.values(a.item)[3], Object.values(b.item)[3]]
  if (a.status === "danger" && b.status === "warn") {
    return -1
  } else if (a.status === "warn" && b.status === "danger") {
    return 1
    // break tie by rationale, then name
  } else if (tieBreakerA < tieBreakerB) {
    return -1
  } else if (tieBreakerA > tieBreakerB) {
    return 1
  } else {
    return 0
  }
}

const rationaleToString = (rationale: string[]) => {
  let string = ""
  if (rationale.length === 1) {
    string += rationale[0]
  } else if (rationale.length > 1) {
    const lastItem = rationale.pop()
    string += `${rationale.join(", ")} and ${lastItem}`
  }
  return string.length > 0 ? string + "." : string
}

const moduleDeletions = async () => {
  const { fetchItems } = useSheetManager()
  const {
    Modules,
    Students,
    Graduates
  } = useDocumentCache()

  const requiredPanels: Panel[] = [
    getPanel("MODULES"),
    getPanel("STUDENTS"),
    getPanel("GRADUATES")
  ]

  for await (const panel of requiredPanels) {
    await fetchItems({
      panelObject: panel,
      showLoading: false,
      fetchEmbeddedPanelData: false
    })
  }

  const modules = Modules.list
  const students = Students.list
  const graduates = Graduates.list

  return modules.map(module => {
    const deletionData: Deletion<Module> = {
      item: module,
      status: null,
      flaggedBecause: []
    }

    if (!module.studentId) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("it is not linked to a student")
    } else {
      const student = students.find(student => student.id === module.studentId)
      const graduate = graduates.find(graduate => graduate.id === module.studentId)
      if (!student && !graduate) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push("it is linked to a student that does not exist")
      } else if (graduate && !student) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push("it is linked to a graduate")
      }
    }

    if (module.docuSignCreated && !module.docuSignCompleted) {
      const docuSignCreated = new Date(module.docuSignCreated)
      const now = new Date()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      if (docuSignCreated < threeMonthsAgo) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push("it has been in progress for over 3 months")
      }
    }

    if (!module.docuSignCreated && !module.docuSignCompleted) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("the docu sign is yet to be created")
    }

    return deletionData
  })
}


const studentDeletions = async () => {
  const { fetchItems } = useSheetManager()
  const {
    Students,
    Modules,
    Graduates,
    "Completed Modules": CompletedModules
  } = useDocumentCache()
  const requiredPanels: Panel[] = [
    getPanel("STUDENTS"),
    getPanel("MODULES"),
    getPanel("GRADUATES"),
    getPanel("COMPLETED_MODULES")
  ]

  for await (const panel of requiredPanels) {
    await fetchItems({
      panelObject: panel,
      showLoading: false,
      fetchEmbeddedPanelData: false
    })
  }

  const students = Students.list
  const modules = Modules.list
  const graduates = Graduates.list
  const completedModules = CompletedModules.list

  return students.map(student => {
    const deletionData: Deletion<Student> = {
      item: student,
      status: null,
      flaggedBecause: []
    }

    if (student.activeStatus === "Request Delete") {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("active status is currently marked as 'Request Delete'")
    }

    if (!student.name) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("this student does not have a name")
    }

    if (student.activeStatus === "Inactive") {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("active status is currently marked as 'Inactive'")
    }

    if (!student.id) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("this student does not have an id")
    } else {
      const otherStudentsWithSameId = students.filter(otherStudent => otherStudent.id === student.id)
      if (otherStudentsWithSameId.length > 1) {
        deletionData.status ??= "warn"
        deletionData.flaggedBecause.push("there is another student with the same id")
      }

      const otherGraduatesWithSameId = graduates.filter(graduate => graduate.id === student.id)
      if (otherGraduatesWithSameId.length > 0) {
        deletionData.status ??= "warn"
        deletionData.flaggedBecause.push("there is a graduate with the same id")
      }

      const completedModulesForThisStudent = completedModules.filter(completedModule => completedModule.studentId === student.id)

      const modulesForThisStudent = modules.filter(module => module.studentId === student.id)

      if (completedModulesForThisStudent.length === 0 && modulesForThisStudent.length === 0) {
        deletionData.status ??= "warn"
        deletionData.flaggedBecause.push("this student has never attempted a module")
      }
    }

    if (!student.year) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("this student has not been assigned a class year")
    }

    return deletionData
  })
}

const properlyOrder = (newOutput: DeletionOutput<SheetItem>[]) => {
  const currentItems = useDialog().getPanelCover.deletionItems
  if (currentItems.length === 0) {
    return newOutput
  } else {
    const orderedItems = []
    for (const currentItem of currentItems) {
      const newItemMatchingIdInCurrentList = newOutput.find(newItem => {
        return newItem.item.sysId === currentItem.item.sysId
      })
      if (newItemMatchingIdInCurrentList) {
        orderedItems.push(newItemMatchingIdInCurrentList)
      }
    }
    return orderedItems
  }
}

const checkSuccess = (newItem: DeletionOutput<SheetItem>): DeletionOutput<SheetItem> => {
  if (newItem.rationale.length > 0) {
    return newItem
  }

  const { getPanelCover } = useDialog()
  const { deletionItems: previousItems } = getPanelCover
  const isInPreviousItems = previousItems.find(item => item.item.sysId === newItem.item.sysId)
  return {
    status: isInPreviousItems ? 'success' : null,
    item: newItem.item,
    rationale: ''
  }
}

export const getSuggestedDeletions = async (panelObject?: Panel) => {
  const { getActivePanel } = useSheetManager()
  const panel = panelObject ?? getActivePanel
  const { sheetRange } = panel
  let output: Deletion<SheetItem>[] = []

  switch (sheetRange) {
    case "Students":
      output = await studentDeletions()
      break
    case "Modules":
      output = await moduleDeletions()
      break
    default:
      return []
  }

  const newDeleteSuggestions = output
    .map(deletionToDeletionOutput)
    .sort(sortItems)
    .map(checkSuccess)

  return properlyOrder(newDeleteSuggestions).filter(deletion => !!deletion.status)
}