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

const sortStudents = (a: DeletionOutput<Student>, b: DeletionOutput<Student>) => {
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
}

const sortModules = (a: DeletionOutput<Module>, b: DeletionOutput<Module>) => {
  if (a.status === "danger" && b.status === "warn") {
    return -1
  } else if (a.status === "warn" && b.status === "danger") {
    return 1
    // break tie by sorting by courseCode
  } else if (a.item.courseCode < b.item.courseCode) {
    return -1
  } else if (a.item.courseCode > b.item.courseCode) {
    return 1
  } else {
    return 0
  }
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


// Modules

// Danger if module docuSignCreated is over 3 months old and docuSignCompleted is false
// Danger if module does not have a studentId
// Danger if modules studentId does not link to a student
// Danger if modules studentId links to a graduate
// Warn if module docuSignCreated and docuSignCompleted are both false

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
      deletionData.flaggedBecause.push("this student has not been assigned a class year")
    }

    if (deletionData.flaggedBecause.length === 0) {
      const { getPanelCover } = useDialog()
      const isInDeletionItems = getPanelCover.deletionItems.find(deletion => deletion.item.sysId === student.sysId)
      if (isInDeletionItems) {
        deletionData.status = "success"
        deletionData.flaggedBecause.push("All issues have been resolved")
      }
    }

    return deletionData
  })
}

export const getSuggestedDeletions = async (panelObject?: Panel) => {
  const { getActivePanel } = useSheetManager()
  const panel = panelObject ?? getActivePanel
  const { sheetRange } = panel
  let output: DeletionOutput<SheetItem>[] = []

  switch (sheetRange) {
    case "Students":
      const studentRecommendations = await studentDeletions()
      output = studentRecommendations.map(deletionToDeletionOutput)
      const currentItems = useDialog().getPanelCover.deletionItems
      if (currentItems.length === 0) {
        output = output.sort(sortStudents)
      } else {
        output = currentItems.map(deletion => {
          const student = output.find(student => student.item.sysId === deletion.item.sysId)
          if (deletion) {
            return student
          } else {
            return null
          }
        }).filter(student => !!student) as DeletionOutput<SheetItem>[]
      }
      break
    case "Modules":
      const moduleRecommendations = await moduleDeletions()
      output = moduleRecommendations
        .map(deletionToDeletionOutput)
        .sort(sortModules)
      break
    default:
      return []
  }

  return output.filter(deletion => !!deletion.status)
}