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

const gradEngagementDeletions = async () => {
  const { fetchItems } = useSheetManager()
  const {
    "Grad Engagements": GradEngagements,
    Graduates,
  } = useDocumentCache()

  const requiredPanels: Panel[] = [
    getPanel("GRADUATES"),
    getPanel("GRADUATE_ENGAGEMENTS")
  ]

  for await (const panel of requiredPanels) {
    await fetchItems({
      panelObject: panel,
      showLoading: false,
      fetchEmbeddedPanelData: false
    })
  }

  const gradEngagements = GradEngagements.list
  const graduates = Graduates.list

  return gradEngagements.map(gradEngagement => {
    const deletionData: Deletion<GradEngagement> = {
      item: gradEngagement,
      status: null,
      flaggedBecause: []
    }

    if (!gradEngagement.event) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("the event does not have a name")
    }

    if (!gradEngagement.gradId) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("it is not linked to a graduate")
    } else {
      const graduate = graduates.find(graduate => graduate.id === gradEngagement.gradId)
      if (!graduate) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push("there is no graduate with the ID it is linked to")
      }
    }

    return deletionData
  })
}

const thesisDeletions = async () => {
  const { fetchItems } = useSheetManager()
  const {
    Theses,
    Graduates,
    Students,
  } = useDocumentCache()

  const requiredPanels: Panel[] = [
    getPanel("THESES"),
    getPanel("GRADUATES"),
    getPanel("STUDENTS")
  ]

  for await (const panel of requiredPanels) {
    await fetchItems({
      panelObject: panel,
      showLoading: false,
      fetchEmbeddedPanelData: false
    })
  }

  const theses = Theses.list
  const graduates = Graduates.list
  const students = Students.list

  return theses.map(thesis => {
    const deletionData: Deletion<Thesis> = {
      item: thesis,
      status: null,
      flaggedBecause: []
    }

    if (!thesis.studentId) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("it is not linked to a student")
    } else {
      const student = students.find(student => student.id === thesis.studentId)
      const graduate = graduates.find(graduate => graduate.id === thesis.studentId)
      if (!student && !graduate) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push("there is no student or graduate with the ID it is linked to")
      } else if (!student && graduate) {
        deletionData.status ??= "warn"
        deletionData.flaggedBecause.push("it is linked to a student who has graduated")
      }
    }

    if (!thesis.title) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("it does not have a title")
    }

    if (thesis.decision === "Rejected") {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("it has been rejected by the honors committee")
    }

    if (thesis.draftReceived) {
      const draftReceived = new Date(thesis.draftReceived)
      const now = new Date()
      const aYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      if (draftReceived < aYearAgo) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push("draft received over a year ago without a final draft")
      }
    }

    return deletionData
  })
}



const graduateDeletions = async () => {
  const { fetchItems } = useSheetManager()
  const {
    Graduates,
    "Grad Engagements": GraduateEngagements,
  } = useDocumentCache()

  const requiredPanels: Panel[] = [
    getPanel("GRADUATES"),
    getPanel("GRADUATE_ENGAGEMENTS")
  ]

  for await (const panel of requiredPanels) {
    await fetchItems({
      panelObject: panel,
      showLoading: false,
      fetchEmbeddedPanelData: false
    })
  }

  const graduates = Graduates.list
  const graduateEngagements = GraduateEngagements.list

  return graduates.map(graduate => {
    const deletionData: Deletion<Graduate> = {
      item: graduate,
      status: null,
      flaggedBecause: []
    }

    if (!graduate.name) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("they do not have a name")
    }

    if (!graduate.id) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("they do not have an ID")
    } else if (!graduateEngagements.some(engagement => engagement.gradId === graduate.id)) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("they have not taken part in any engagements")
    }

    if (graduate.email.toLowerCase().endsWith("@yahoo.com")) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("they gave you a Yahoo email address (its probably not their primary email and some throwaway they made 10 years ago)")
    }

    return deletionData
  })
}

const completedModuleDeletions = async () => {
  const { fetchItems } = useSheetManager()
  const {
    Students,
    Graduates,
    "Completed Modules": CompletedModules
  } = useDocumentCache()

  const requiredPanels: Panel[] = [
    getPanel("STUDENTS"),
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

  const completedModules = CompletedModules.list
  const students = Students.list
  const graduates = Graduates.list

  return completedModules.map(module => {
    const deletionData: Deletion<CompletedModule> = {
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
        deletionData.flaggedBecause.push("it is linked to a student who has graduated")
      }
    }

    return deletionData
  })
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
        deletionData.flaggedBecause.push("it is linked to a student who has graduated")
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
      deletionData.flaggedBecause.push("they do not have a name")
    }

    if (student.activeStatus === "Inactive") {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("active status is currently marked as 'Inactive'")
    }

    if (!student.id) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("they do not have an id")
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
    case "Completed Modules":
      output = await completedModuleDeletions()
      break
    case "Graduates":
      output = await graduateDeletions()
      break
    case "Theses":
      output = await thesisDeletions()
      break
    case "Grad Engagements":
      output = await gradEngagementDeletions()
      break
    default:
      return []
  }

  const newDeleteSuggestions = output
    .map(deletionToDeletionOutput)
    .map(checkSuccess)
    .filter(deletion => !!deletion.status)

  const currentItems = useDialog().getPanelCover.deletionItems
  if (currentItems.length === 0) {
    return newDeleteSuggestions.sort(sortItems)
  } else {
    return properlyOrder(newDeleteSuggestions)
  }
}