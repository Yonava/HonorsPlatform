
// Students Danger
// Status: Request Delete
// Name: Is Blank

// Students Warn
// Status: Inactive
// ID: Is Blank
// Has Never Attempted A Module
// Year: Is Blank
// There is a graduate with the same name or id

import { Panel, PanelRange } from "./Panels";
import { useSheetManager } from './store/useSheetManager'
import { useDocumentCache } from "./store/useDocumentCache";

const studentDeletions = async () => {

}

const getSuggestedDeletions = async (panelObject?: Panel) => {
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