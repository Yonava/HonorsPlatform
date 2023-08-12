import { Panel, getPanel } from "./Panels";
import { useStudentMatcher } from "./StudentMatcher";
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

  const [tieBreakerA, tieBreakerB] = [
    Object.values(a.item)[3],
    Object.values(b.item)[3]
  ]

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

  const { "Grad Engagements": GradEngagements } = useDocumentCache()
  const gradEngagements = GradEngagements.list

  const graduatePanel = getPanel('GRADUATES')
  const studentPanel = getPanel('STUDENTS')

  return gradEngagements.map(gradEngagement => {
    const deletionData: Deletion<GradEngagement> = {
      item: gradEngagement,
      status: null,
      flaggedBecause: []
    }

    if (!gradEngagement.event) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("no event name")
    }

    const { studentMatch } = useStudentMatcher(gradEngagement.studentSysId)
    if (studentMatch.value?.error) {
      deletionData.status = "danger"
      const { error } = studentMatch.value
      if (error === 'NOT_FOUND') {
        deletionData.flaggedBecause.push(`no ${graduatePanel.title.singular} found`)
      } else if (error === 'STUDENT_SYSID_UNDEFINED' || error === 'NOT_LINKED') {
        deletionData.flaggedBecause.push(`no ${graduatePanel.title.singular} linked`)
      }
    } else if (studentMatch.value.foundIn === 'STUDENTS') {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push(`is still a ${studentPanel.title.singular}`)
    }

    return deletionData
  })
}

const thesisDeletions = async () => {

  const { Theses } = useDocumentCache()
  const theses = Theses.list

  const studentPanel = getPanel('STUDENTS')

  return theses.map(thesis => {
    const deletionData: Deletion<Thesis> = {
      item: thesis,
      status: null,
      flaggedBecause: []
    }

    if (!thesis.title) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("no title")
    }

    if (thesis.decision === "Rejected") {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("rejected by the honors committee")
    }

    const { studentMatch } = useStudentMatcher(thesis.studentSysId)
    if (studentMatch.value?.error) {
      deletionData.status = "danger"
      const { error } = studentMatch.value
      if (error === 'NOT_FOUND') {
        deletionData.flaggedBecause.push(`no ${studentPanel.title.singular} found`)
      } else if (error === 'STUDENT_SYSID_UNDEFINED' || error === 'NOT_LINKED') {
        deletionData.flaggedBecause.push(`no ${studentPanel.title.singular} linked`)
      } else {
        deletionData.flaggedBecause.push("error with student link")
      }
    } else if (studentMatch.value.foundIn === 'GRADUATES') {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push(`${studentPanel.title.singular} has graduated`)
    }

    if (!thesis.mentor) {
      deletionData.status ??= 'warn'
      deletionData.flaggedBecause.push("no mentor")
    }

    return deletionData
  })
}

const graduateDeletions = async () => {

  const { Graduates } = useDocumentCache()
  const graduates = Graduates.list

  return graduates.map(graduate => {
    const deletionData: Deletion<Graduate> = {
      item: graduate,
      status: null,
      flaggedBecause: []
    }

    if (!graduate.name) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("no name")
    }

    if (!graduate.id) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("no ID")
    }

    return deletionData
  })
}

const completedModuleDeletions = async () => {

  const { "Completed Modules": CompletedModules } = useDocumentCache()
  const completedModules = CompletedModules.list

  const studentPanel = getPanel('STUDENTS')

  return completedModules.map(module => {
    const deletionData: Deletion<CompletedModule> = {
      item: module,
      status: null,
      flaggedBecause: []
    }

    const { studentMatch } = useStudentMatcher(module.studentSysId)
    if (studentMatch.value?.error) {
      deletionData.status = "danger"
      const { error } = studentMatch.value
      if (error === 'NOT_FOUND') {
        deletionData.flaggedBecause.push(`no ${studentPanel.title.singular} found`)
      } else if (error === 'STUDENT_SYSID_UNDEFINED' || error === 'NOT_LINKED') {
        deletionData.flaggedBecause.push(`no ${studentPanel.title.singular} linked`)
      } else {
        deletionData.flaggedBecause.push(`error with ${studentPanel.title.singular} link`)
      }
    } else if (studentMatch.value.foundIn === 'GRADUATES') {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push(`${studentPanel.title.singular} has graduated`)
    }

    return deletionData
  })
}

const moduleDeletions = async () => {

  const { Modules } = useDocumentCache()
  const modules = Modules.list

  const studentPanel = getPanel('STUDENTS')

  return modules.map(module => {
    const deletionData: Deletion<Module> = {
      item: module,
      status: null,
      flaggedBecause: []
    }

    const docuSignCreated = new Date(module.docuSignCreated)
    const docuSignCompleted = new Date(module.docuSignCompleted)

    if (!module.docuSignCreated && !module.docuSignCompleted) {
      deletionData.status ??= "warn"
      deletionData.flaggedBecause.push("no DocuSign")
    }

    // docuSignCreated is filled in but with invalid dates
    else if (docuSignCreated.toString() === 'Invalid Date' && module.docuSignCreated) {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push("invalid creation date")

    }

    // over n months in progress
    else if (module.docuSignCreated && !module.docuSignCompleted) {
      const months = 3
      const docuSignCreated = new Date(module.docuSignCreated)
      const now = new Date()
      const dateOfFlag = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
      if (docuSignCreated < dateOfFlag) {
        deletionData.status = "danger"
        deletionData.flaggedBecause.push(`in progress for ${months}+ months`)
      }
    }

    const { studentMatch } = useStudentMatcher(module.studentSysId)
    if (studentMatch.value?.error) {
      deletionData.status = "danger"
      const { error } = studentMatch.value
      if (error === 'NOT_FOUND') {
        deletionData.flaggedBecause.push(`no ${studentPanel.title.singular} found`)
      } else if (error === 'STUDENT_SYSID_UNDEFINED' || error === 'NOT_LINKED') {
        deletionData.flaggedBecause.push(`no ${studentPanel.title.singular} linked`)
      } else {
        deletionData.flaggedBecause.push(`error with ${studentPanel.title.singular} link`)
      }
    } else if (studentMatch.value.foundIn === 'GRADUATES') {
      deletionData.status = "danger"
      deletionData.flaggedBecause.push(`${studentPanel.title.singular} has graduated`)
    }

    return deletionData
  })
}


const studentDeletions = async () => {
  const {
    Students,
    Modules,
    Graduates,
    "Completed Modules": CompletedModules
  } = useDocumentCache()

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