import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getPanel, PanelName } from '@panels'
import type { SheetItem, Student, Graduate, Module, CompletedModule } from '@apptypes/sheetItems'
import { useDialog } from '@store/useDialog'
import type { DialogContentOptions } from '@store/useDialog'
import { useSheetManager } from '@store/useSheetManager'
import { useDocumentCache } from '@store/useDocumentCache'
import warn from '@utils/Warn'
import { moveToGraduates, moveToStudents } from '@utils/students'
import MoveModule from './components/Detail/Helper/MoveModule.vue'

const notSavedToSheetDialog = (item: SheetItem) => {
  const { open, close } = useDialog()
  const { getPanelNameFromItemSysId } = useDocumentCache()
  const panelName = getPanelNameFromItemSysId(item.sysId)
  if (!panelName) return
  const panel = getPanel(panelName)
  return open({
    title: `Nothing to Move!`,
    description: `Try adding something to this ${panel.title.singular.toLowerCase()} first.`,
    buttons: [
      {
        text: 'Ok',
        color: 'red',
        onClick: close
      }
    ]
  })
}

type MovementHandlerOptions<T extends SheetItem> = {
  item: T,
  moveItem: (item: T) => Promise<void>,
  beforeMove?: (item: T) => Promise<any>,
  successDialog?: (close: () => {}) => DialogContentOptions,
  onSuccess?: (item: T) => Promise<any>,
}

const moveHandler = async <T extends SheetItem>(options: MovementHandlerOptions<T>) => {
  const { itemPostedToSheet } = useDocumentCache()
  const { open, close } = useDialog()

  const {
    item,
    moveItem,
    beforeMove,
    onSuccess,
    successDialog,
  } = options

  if (!itemPostedToSheet(item)) {
    notSavedToSheetDialog(item)
    return
  }

  try {
    await beforeMove?.(item)
  } catch (e) {
    throw e
  }

  try {
    await moveItem(item)
  } catch (e) {
    throw e
  }

  try {
    await onSuccess?.(item)
  } catch (e) {
    throw e
  }

  if (successDialog) open(successDialog(close))
}

const studentHandler = async (student: Student) => {
  const { setPanel } = useSheetManager()

  const graduatePanel = getPanel('GRADUATES')
  const { title } = getPanel('STUDENTS')
  const name = student.name || `this ${title.singular.toLowerCase()}`;
  const athletics = student.athletics.toLowerCase() || 'no athletics';
  const year = student.year.toLowerCase() || 'no class year';
  const points = student.points || 0;

  const warnDialog = {
    title: `Graduate ${name}?`,
    description: `Are you sure you want to graduate ${name}? Information such as point count (${points}), athletics (${athletics}), and class year (${year}) will be permanently lost.`,
  } as const

  const successDialog = (close: () => {}) => ({
    title: `${name} Graduated`,
    description: `${name} has been successfully moved to ${graduatePanel.title.plural}.`,
    buttons: [{
      text: `View new ${graduatePanel.title.singular} profile`,
      color: graduatePanel.color,
      onClick: () => {
        close()
        setPanel(graduatePanel.panelName, {
          value: student.sysId
        })
      }
    }]
  })

  return moveHandler({
    item: student,
    beforeMove: async () => warn(warnDialog),
    moveItem: moveToGraduates,
    successDialog,
  })
}

const graduateHandler = async (graduate: Graduate) => {
  const { setPanel } = useSheetManager()

  const studentPanel = getPanel('STUDENTS')
  const { title } = getPanel('GRADUATES')
  const name = graduate.name || `this ${title.singular.toLowerCase()}`;
  const warnDialog = {
    title: `Move ${name} Back to ${studentPanel.title.plural}?`,
    description: `Are you sure you want to move ${name} back to ${studentPanel.title.plural}? Information like phone number and graduation date will be permanently lost.`,
  } as const

  const successDialog = (close: () => {}) => ({
    title: `${name} Moved Back Successfully`,
    description: `${name} has been moved back to ${studentPanel.title.plural}.`,
    buttons: [{
      text: `View new ${studentPanel.title.singular} profile`,
      color: studentPanel.color,
      onClick: () => {
        close()
        setPanel(studentPanel.panelName, {
          value: graduate.sysId
        })
      }
    }]
  })

  return moveHandler({
    item: graduate,
    beforeMove: async () => warn(warnDialog),
    moveItem: moveToStudents,
    successDialog,
  })
}

export const movementHandlers = {
  STUDENTS: studentHandler,
  GRADUATES: graduateHandler,
  MODULES: async (item: SheetItem) => {
    await new Promise((resolve, reject) => {
      useDialog().open({
        component: MoveModule,
        props: {
          module: item,
          resolve,
          reject
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
  } as const

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