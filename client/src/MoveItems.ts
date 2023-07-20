import {
  getPanel,
  type PanelName,
  type Panel
} from './Panels'
import type { SheetItem, Student, Graduate, Module, CompletedModule } from './SheetTypes'

import { useDialog } from './store/useDialog'
import { useSheetManager } from './store/useSheetManager'
import { warn } from './Warn'
import { moveToGraduates, moveToStudents } from './StudentTools'

type MovementFn = (item: SheetItem) => Promise<void>

type MoveItem = {
  [key in PanelName]?: {
    to: Panel,
    handler: MovementFn
  }
}

const savedToSheet = (item: SheetItem) => {
  return typeof item.row === "number"
}

export const movementHandlers = {
  STUDENTS: async (item: SheetItem) => {

    const graduatePanel = getPanel('GRADUATES')
    const studentPanel = getPanel('STUDENTS')
    const { open, close } = useDialog()
    const { setPanel } = useSheetManager()

    if (!savedToSheet(item)) {
      return;
    }

    const student = JSON.parse(JSON.stringify(item)) as Student;

    const name = student.name || `this ${studentPanel.title.singular.toLowerCase()}`;

    try {
      await warn({
        title: `Graduate ${name}?`,
        description: `Are you sure you want to graduate ${name}? Graduating ${name} will remove them from the ${studentPanel.title.singular.toLowerCase()} list and add them to the ${graduatePanel.title.plural.toLowerCase()} list. This action will permanently erase data such as point count (${student.points || 0}), athletic affiliation (${student.athletics.toLowerCase() || 'no athletics'}), class year (${student.year.toLowerCase() || 'no class year'}) and more.`
      })
    } catch {
      throw new Error('Graduation cancelled.')
    }

    try {
      await moveToGraduates(student);
    } catch (e) {
      throw new Error(`Failed to graduate ${name}.`);
    }

    open({
      body: {
        title: `${student.name || studentPanel.title.singular} Graduated`,
        description: `${student.name || studentPanel.title.singular} has been successfully moved to ${graduatePanel.title.plural}.`,
        buttons: [
          {
            text: "Dismiss",
            color: studentPanel.color,
            onClick: close,
          },
          {
            text: `View new ${graduatePanel.title.singular} profile`,
            color: graduatePanel.color,
            onClick: () => {
              setPanel(graduatePanel.panelName, {
                value: student.sysId
              });
              close();
            },
          },
        ],
      },
    });
  },
  GRADUATES: async (item: SheetItem) => {

    const graduatePanel = getPanel('GRADUATES')
    const studentPanel = getPanel('STUDENTS')
    const { open, close } = useDialog()
    const { setPanel } = useSheetManager()

    if (!savedToSheet(item)) {
      return;
    }

    try {
      await warn({
        description: `Are you sure you want to move this ${graduatePanel.title.singular.toLowerCase()} back to ${graduatePanel.title.plural.toLowerCase()}? Information like phone number and graduation date will be permanently lost.`
      });
    } catch (e) {
      throw new Error('Student move cancelled.')
    }

    const grad = JSON.parse(JSON.stringify(item)) as Graduate;

    try {
      await moveToStudents(grad)
    } catch (e) {
      throw new Error(`Failed to move ${grad.name || graduatePanel.title.singular.toLowerCase()}.`)
    }

    open({
      body: {
        title: "Success!",
        description: `${grad.name || graduatePanel.title.singular} has been moved over to ${studentPanel.title.plural}.`,
        buttons: [
          {
            text: "Dismiss",
            color: graduatePanel.color,
            onClick: close,
          },
          {
            text: `View ${studentPanel.title.singular} Profile`,
            color: studentPanel.color,
            onClick: () => {
              setPanel(studentPanel.panelName, {
                value: grad.sysId,
              });
              close();
            },
          }
        ],
      },
    });
  }
}

export const getMoveItem = () => ({
  'STUDENTS': {
    to: getPanel('GRADUATES'),
    handler: movementHandlers.STUDENTS
  },
  'GRADUATES': {
    to: getPanel('STUDENTS'),
    handler: movementHandlers.GRADUATES
  }
})