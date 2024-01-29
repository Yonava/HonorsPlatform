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
import MoveModule from '../components/Detail/Helper/MoveModule.vue'

const completedModuleToModule = (completedModule: CompletedModule): Module => {
  const { grade, dateCompleted, ...module } = completedModule
  return module
}

type MovementHandlerOptions<T extends SheetItem> = {
  itemBeforeMove: T,
  moveItem: (item: T) => Promise<any>,
  beforeMove?: () => Promise<any>,
  successDialog?: (close: () => {}) => DialogContentOptions,
  onSuccess?: () => Promise<any>,
}

const moveHandler = async <T extends SheetItem>(options: MovementHandlerOptions<T>) => {
  const { itemPostedToSheet } = useDocumentCache()
  const { open, close, openSnackbar } = useDialog()

  const {
    itemBeforeMove,
    moveItem,
    beforeMove,
    onSuccess,
    successDialog,
  } = options

  if (!itemPostedToSheet(itemBeforeMove)) {
    openSnackbar({
      text: 'Nothing To Move!'
    })
    return
  }

  try {
    await beforeMove?.()
  } catch (e) {
    throw e
  }

  try {
    await moveItem(itemBeforeMove)
  } catch (e) {
    throw e
  }

  try {
    await onSuccess?.()
  } catch (e) {
    throw e
  }

  if (successDialog) open(successDialog(close))
  else openSnackbar({
    text: 'Success!'
  })
}

const studentHandler = async (student: Student) => {
  const { title } = getPanel('STUDENTS')
  const name = student.name || `this ${title.singular.toLowerCase()}`;
  const athletics = student.athletics.toLowerCase() || 'no athletics';
  const year = student.year.toLowerCase() || 'no class year';
  const points = student.points || 0;

  const warnDialog = {
    title: `Graduate ${name}?`,
    description: `Are you sure you want to graduate ${name}? Information such as point count (${points}), athletics (${athletics}), and class year (${year}) will be permanently lost.`,
  } as const

  return moveHandler({
    itemBeforeMove: student,
    beforeMove: () => warn(warnDialog),
    moveItem: moveToGraduates,
  })
}

const graduateHandler = async (graduate: Graduate) => {
  const studentPanel = getPanel('STUDENTS')
  const { title } = getPanel('GRADUATES')
  const name = graduate.name || `this ${title.singular.toLowerCase()}`;

  const warnDialog = {
    title: `Move ${name} Back to ${studentPanel.title.plural}?`,
    description: `Are you sure you want to move ${name} back to ${studentPanel.title.plural}? Information like phone number and graduation date will be permanently lost.`,
  } as const

  return moveHandler({
    itemBeforeMove: graduate,
    beforeMove: () => warn(warnDialog),
    moveItem: moveToStudents,
  })
}

const completedModuleHandler = async (completedModule: CompletedModule) => {
  const {
    title: moduleTitle,
    panelName: modulePanelName
  } = getPanel('MODULES')
  const {
    title: cModuleTitle, properties,
    panelName: completedModulePanelName
  } = getPanel('COMPLETED_MODULES')
  const { moveItemBetweenLists } = useDocumentCache()

  const courseCode = completedModule[properties.title] || `This ${cModuleTitle.singular}`
  const grade = completedModule.grade || 'ungraded'
  const dateOfCompletion = completedModule.dateCompleted || 'no date'

  const warnDialog = {
    title: `Move ${courseCode} Back to ${moduleTitle.plural}`,
    description: `Are you sure you want to move ${courseCode} back to ${moduleTitle.plural}? Information such as final grade (${grade}) and date of completion (${dateOfCompletion}) will be permanently lost.`
  }

  return moveHandler({
    itemBeforeMove: completedModule,
    beforeMove: () => warn(warnDialog),
    moveItem: () => moveItemBetweenLists({
      item: completedModuleToModule(completedModule),
      oldPanelName: completedModulePanelName,
      newPanelName: modulePanelName,
    })
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
  COMPLETED_MODULES: completedModuleHandler,
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