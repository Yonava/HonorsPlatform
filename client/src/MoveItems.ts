import {
  getPanel,
  PanelName,
  panels,
  type Panel
} from './Panels'
import type { SheetItem, Student, Graduate, Module, CompletedModule } from './SheetTypes'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import MoveModule from './components/Detail/Helper/MoveModule.vue'
import { useDialog } from './store/useDialog'
import { useSheetManager } from './store/useSheetManager'
import { warn } from './Warn'
import { moveToGraduates, moveToStudents } from './StudentTools'
import { useDocumentCache } from './store/useDocumentCache'

const savedToSheet = (item: SheetItem, panel?: Panel) => {
  const { open, close } = useDialog()
  const { getActivePanel } = useSheetManager()
  panel ??= getActivePanel
  const isSaved = typeof item.row === "number"
  if (!isSaved) {
    const secondsWasted = 5
    open({
      persistent: true,
      body: {
        title: `Nothing to Move!`,
        description: `It isn't very practical to move nothing, is it? Try adding something to this ${panel.title.singular.toLowerCase()} before bothering me about moving it. In fact, just for that, I'm going to waste ${secondsWasted} seconds of your time.`,
        buttons: [
          {
            text: `Dismiss (Wait ${secondsWasted} Seconds Once Clicked)`,
            color: 'red',
            onClick: () => {
              setTimeout(close, secondsWasted * 1000)
            }
          }
        ]
      },
    })
  }
  return isSaved
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
  },
  MODULES: async (item: SheetItem) => {
    await new Promise((resolve, reject) => {
      useDialog().open({
        component: {
          render: MoveModule,
          props: {
            module: item,
            resolve,
            reject
          }
        }
      })
    })
  },
  COMPLETED_MODULES: async (item: SheetItem) => {

    const modulePanel = getPanel('MODULES')
    const completedModulePanel = getPanel('COMPLETED_MODULES')
    const { open, close } = useDialog()
    const { setPanel } = useSheetManager()
    const { moveItemBetweenLists } = useDocumentCache()
    const completedModule = item as CompletedModule

    const { grade, completedDate, ...rest } = completedModule
    const newItem: Module = rest;

    const title = completedModule[completedModulePanel.properties.title] || `This ${completedModulePanel.title.singular}`

    try {
      await warn({
        title: `Move ${title} Back to ${modulePanel.title.plural}?`,
        description: `Are you sure you want to move ${title.toLowerCase()} back to ${modulePanel.title.plural}? This action will remove the grade (${completedModule.grade || 'ungraded'}) and completed date (${completedModule.completedDate || 'no completion date'}) and cannot be undone.`,
      })
    } catch (e) {
      throw e
    }

    await moveItemBetweenLists({
      item: newItem,
      oldPanelName: completedModulePanel.panelName,
      newPanelName: modulePanel.panelName,
    })

    open({
      body: {
        title: `${title} Moved Back Successfully`,
        description: `${title} has been moved back to ${modulePanel.title.plural}.`,
        buttons: [
          {
            text: 'Dismiss',
            color: 'red',
            onClick: () => close(),
          },
          {
            text: `View ${modulePanel.title.singular}`,
            color: `${modulePanel.color}-darken-2`,
            onClick: () => {
              setPanel(modulePanel.panelName, {
                value: newItem.sysId
              })
              close()
            },
          }
        ]
      },
    })
  },
}

export const useMoveItem = (originatingPanelName?: PanelName) => {

  const sheetManager = useSheetManager()

  const { getActivePanel } = storeToRefs(sheetManager)
  const panelName = computed(() => originatingPanelName ?? getActivePanel.value.panelName)

  const movingItem = ref(false)

  const movements = {
    'STUDENTS': {
      to: getPanel('GRADUATES'),
      handler: movementHandlers.STUDENTS
    },
    'GRADUATES': {
      to: getPanel('STUDENTS'),
      handler: movementHandlers.GRADUATES
    },
    'MODULES': {
      to: getPanel('COMPLETED_MODULES'),
      handler: movementHandlers.MODULES
    },
    'COMPLETED_MODULES': {
      to: getPanel('MODULES'),
      handler: movementHandlers.COMPLETED_MODULES
    },
    'GRADUATE_ENGAGEMENTS': null,
    'THESES': null,
  }

  const movementObject = computed(() => {
    return movements[panelName.value]
  })

  const moveItem = async (item?: SheetItem) => {
    const { focusedItemSysId, setFocusedEmbeddedItem } = useSheetManager()
    const { getItemBySysId } = useDocumentCache()

    if (!item && focusedItemSysId) {
      item = getItemBySysId(focusedItemSysId)
    }

    if (!item) {
      throw new Error('No item to move.')
    }

    movingItem.value = true
    try {
      await movementObject.value?.handler(item) ?? Promise.reject(new Error(`No movement handler for ${panelName.value}`))
      setFocusedEmbeddedItem(null)
    } catch (e) {
      console.error(e)
    } finally {
      movingItem.value = false
    }
  }

  return {
    movingItem,
    moveItem,
    movementObject,
    panelOnceMoved: movementObject.value?.to,
  }
}