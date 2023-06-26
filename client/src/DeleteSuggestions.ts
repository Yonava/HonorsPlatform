import { Panel, getPanel } from "./Panels";
import { useSheetManager } from './store/useSheetManager'
import { useDocumentCache } from "./store/useDocumentCache";

type Deletion = {
  item: any,
  status: null | "danger" | "warn",
  flaggedBecause: string[]
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const rationaleToString = (rationale: string[]) => {
  if (rationale.length === 1) {
    return rationale[0]
  } else if (rationale.length === 2) {
    return `${rationale[0]} and ${rationale[1]}`
  } else {
    const lastItem = rationale.pop()
    return `${rationale.join(", ")}, and ${lastItem}`
  }
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
    const deletionData: Deletion = {
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
      deletionData.status = "warn"
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
      deletionData.flaggedBecause.push("this student does not have a year")
    }

    return deletionData
  }).filter(deletion => !!deletion.status).map(deletion => {
    return {
      rationale: capitalize(rationaleToString(deletion.flaggedBecause)),
      status: deletion.status,
      item: deletion.item
    }
  }).sort((a, b) => {
    if (a.status === "danger" && b.status === "warn") {
      return -1
    } else if (a.status === "warn" && b.status === "danger") {
      return 1
      // break tie by sorting by name
    } else if (a.item.name < b.item.name) {
      return -1
    } else if (a.item.name > b.item.name) {
      return 1
    } else {
      return 0
    }
  })
}

export const getSuggestedDeletions = async (panelObject?: Panel) => {
  const { getActivePanel } = useSheetManager()
  const panel = panelObject ?? getActivePanel
  const { sheetRange } = panel

  switch (sheetRange) {
    case "Students":
      return await studentDeletions()
    default:
      return []
  }
}