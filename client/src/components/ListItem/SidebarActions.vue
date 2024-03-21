<template>
  <div
    :style="{
      transition: show || isPinned ? '300ms ease-in-out' : '100ms',
      transitionDelay: show || isPinned ? '100ms' : '0',
      pointerEvents: show || isPinned ? 'all' : 'none',
      width: '30px',
      height: '65px',
      position: 'absolute',
      opacity: show || isPinned ? '1' : '0'
    }"
  >

    <!-- item quick actions -->
    <div
      class="d-flex flex-column"
      style="position: relative; height: 100%; gap: 2px; transform: translateY(-5px)"
    >
      <div
        v-for="{ icon, onClick, tooltip, actionId } in sidebarActions"
        :key="icon"
        @click.stop="onClick(item)"
        @mouseover="hoveredAction = actionId"
        @mouseleave="hoveredAction = null"
      >

        <v-icon>
          {{ icon(hoveredAction === actionId) }}
        </v-icon>

        <v-tooltip activator="parent">
          {{ tooltip }}
        </v-tooltip>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSheetManager} from '@store/useSheetManager'
import type { SheetItem, IncludeByProp } from '@apptypes/sheetItems'
import type { PanelName, PanelToSheetType } from '@panels'
import { getPanel } from '@panels'
import { emailValidator, sendEmail } from '@utils/emails'
import { matchStudent } from '../../StudentMatcher'
import { useDocumentCache } from '@store/useDocumentCache'

const { setPanel } = useSheetManager()
const { readOnlyMode, getActivePanel } = storeToRefs(useSheetManager())
const { deleteItem } = useDocumentCache()

const props = defineProps<{
  show: boolean,
  item: SheetItem
}>()

const isPinned = computed(() => {
  return !!useSheetManager().getPinnedItem(props.item)
})

const togglePin = () => {
  const { removePinnedItem: remove, addPinnedItem: add } = useSheetManager()
  isPinned.value ? remove(props.item) : add(props.item)
  hoveredAction.value = null
}

type ActionId = string
const hoveredAction = ref<ActionId | null>(null)

type SidebarActionFunction<T extends SheetItem = SheetItem> = (item: T) => {
  icon: (isHovered: boolean) => string,
  tooltip: string,
  onClick: (...args: any) => void,
  disableInReadOnlyMode?: boolean,
  actionId: string
} | undefined

type SidebarAction = ReturnType<SidebarActionFunction>
type DefinedSidebarAction = Exclude<SidebarAction, undefined>

type PanelSpecificActions = {
  [K in PanelName]: SidebarActionFunction<PanelToSheetType[K]>
}

const panelSpecificActions: PanelSpecificActions = {
  'STUDENTS': emailAction,
  'GRADUATES': emailAction,
  'MODULES': jumpToProfileAction,
  'COMPLETED_MODULES': jumpToProfileAction,
  'THESES': jumpToProfileAction,
  'GRADUATE_ENGAGEMENTS': jumpToProfileAction,
}

function jumpToProfileAction<T extends IncludeByProp<'studentSysId'>>(item: T): SidebarAction {
  const match = matchStudent(item.studentSysId)
  if ('error' in match) return

  const { foundIn, name, sysId } = match
  const { icon, title } = getPanel(foundIn)

  return {
    icon: (isHovered) => isHovered ? icon : `${icon}-outline`,
    tooltip: `View ${name || title.singular}`,
    onClick: () => setPanel(foundIn, { value: sysId }),
    actionId: 'jump-to-profile'
  } as const
}

function emailAction<T extends IncludeByProp<'email'>>(item: T): SidebarAction {
  const { email } = item
  if (!(email && emailValidator(email))) return
  return {
    icon: (isHovered) => isHovered ? 'mdi-email-fast' : 'mdi-email-fast-outline',
    tooltip: 'Email',
    onClick: () => sendEmail(email),
    actionId: 'email'
  } as const
}

function pinAction(): SidebarAction {
  return {
    icon: (isHovered) => isHovered || isPinned.value ? 'mdi-pin' : 'mdi-pin-outline',
    tooltip: isPinned.value ? 'Unpin' : 'Pin',
    onClick: togglePin,
    actionId: 'pin'
  } as const
}

function deleteAction(): SidebarAction {
  return {
    icon: (isHovered) => isHovered ? 'mdi-delete' : 'mdi-delete-outline',
    tooltip: 'Delete',
    onClick: () => {
      deleteItem({
        item: props.item
      })
    },
    disableInReadOnlyMode: true,
    actionId: 'delete'
  } as const
}

const sidebarActions = computed(() => {
  const panelSpecificAction = panelSpecificActions[getActivePanel.value.panelName]
  const actionFns = [pinAction, panelSpecificAction, deleteAction]

  const actionFilter = (action: SidebarAction) => {
    if (!action) return false
    if (action.disableInReadOnlyMode && readOnlyMode.value) return false
    return true
  }

  const actions = actionFns.map((actionFn) => actionFn(props.item as any))
  return actions.filter(actionFilter) as DefinedSidebarAction[]
})
</script>