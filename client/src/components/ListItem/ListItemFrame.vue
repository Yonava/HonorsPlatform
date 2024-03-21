<template>
  <div style="height: 100%; position: relative">

    <!-- if item styled (ie being served from PanelList) -->
    <div
      v-if="styled"
      @dragstart="dragStart"
      @dragend="useSheetManager().listItemBeingDragged = null"
      @mouseover="setHovered(true)"
      @mouseleave="setHovered(false)"
      :draggable="mdAndUp && !isSelected"
      :class="[
        'item-card',
        'pa-4',
        isSelected ? 'selected-item-card' : '',
        'd-flex',
        'flex-row'
      ]"
      style="height: 100%;"
    >

      <div
        :style="{
          transition: hovered || isPinned ? '300ms ease-in-out' : '100ms',
          transitionDelay: hovered || isPinned ? '100ms' : '0',
          pointerEvents: hovered || isPinned ? 'all' : 'none',
          width: '30px',
          height: '65px',
          position: 'absolute',
          opacity: hovered || isPinned ? '1' : '0'
        }"
      >

        <!-- item quick actions -->
        <div
          class="d-flex flex-column"
          style="position: relative; height: 100%; gap: 2px; transform: translateY(-5px)"
        >

          <div
            @click.stop="togglePin"
            @mouseover="hoverData['pin'] = true"
            @mouseleave="hoverData['pin'] = false"
          >

            <v-icon>
              mdi-pin{{ hoverData['pin'] || isPinned ? '' : '-outline' }}
            </v-icon>

            <v-tooltip activator="parent">
              {{ isPinned ? 'Unpin' : 'Pin' }}
            </v-tooltip>
          </div>

          <div
            v-for="{ icon, onClick, tooltip } in sidebarActionButtons"
            :key="icon"
            @click.stop="onClick(item)"
            @mouseover="hoverData[icon] = true"
            @mouseleave="hoverData[icon] = false"
          >

            <v-icon>
              {{ icon }}{{ hoverData[icon] ? '' : '-outline' }}
            </v-icon>

            <v-tooltip
              activator="parent"
            >
              {{ tooltip }}
            </v-tooltip>

          </div>
        </div>
      </div>

      <v-spacer></v-spacer>

      <div
        class="d-flex align-center"
        :style="{
          transition: '300ms ease-in-out',
          width: hovered || isPinned ? 'calc(100% - 35px)' : '100%',
          position: 'relative'
        }"
      >
        <div
          class="d-flex flex-column"
          style="position: relative; height: 60px; transform: translateY(-5px)"
        >

          <!-- accounts engaging item -->
          <div
            v-for="(account, i) in accounts"
            :key="account.id"
            class="mr-2"
            :style="{
              transform: `translateY(${i * -20}px)`,
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: '1px solid white',
              cursor: 'pointer',
            }"
          >
            <img
              :src="account.picture"
              :style="{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                objectFit: 'cover',
              }"
            />
          </div>

        </div>

        <div
          :style="{
            width: accounts.length > 0 ? 'calc(100% - 40px)' : '100%',
          }"
        >

          <div class="d-flex flex-row">
            <slot name="left"></slot>
            <v-spacer></v-spacer>
            <slot name="right"></slot>
          </div>
          <slot name="corners"></slot>
        </div>

      </div>
    </div>

    <!-- if not styled (ie served from PanelCover for Delete Suggestions) -->
    <div
      v-else
      @dragstart="dragStart"
      @dragend="useSheetManager().listItemBeingDragged = null"
      :draggable="mdAndUp && !isSelected"
    >
      <div style="width: 100%">
        <div class="d-flex flex-row">
          <slot name="left"></slot>
          <v-spacer></v-spacer>
          <slot name="right"></slot>
        </div>
        <slot name="corners"></slot>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { getPanel, PanelName, PanelToSheetType } from '@panels'
import { emailValidator, sendEmail } from '@utils/emails'
import { useSheetManager } from '@store/useSheetManager'
import { useDocumentCache } from '@store/useDocumentCache'
import { useSocket } from '@store/useSocket'
import { SheetItem } from '@apptypes/sheetItems'
import { matchStudent } from '../../StudentMatcher'
import type { IncludeByProp } from '@apptypes/sheetItems'

const sheetManager = useSheetManager()
const { setPanel } = useSheetManager()
const { getActivePanel } = storeToRefs(sheetManager)

const props = defineProps<{
  item: SheetItem,
  styled?: boolean
}>()

const { mdAndUp } = useDisplay()

const { readOnlyMode } = storeToRefs(useSheetManager())
const { getSelectedItems, deleteItem } = useDocumentCache()
const { focusData, getUniqueConnectedSockets } = storeToRefs(useSocket())

const accounts = computed(() => {
  return getUniqueConnectedSockets.value.filter(({ socketId }) => {
    const sysIdAccountIsFocusedOn = focusData.value[socketId]?.sysId;
    return sysIdAccountIsFocusedOn === props.item.sysId
  });
})

const hovered = ref(false)

function jumpToProfileAction<T extends IncludeByProp<'studentSysId'>>(item: T) {
  const match = matchStudent(item.studentSysId)
  if ('error' in match) return

  const { foundIn, name, sysId } = match
  const { icon, title } = getPanel(foundIn)

  return {
    icon,
    tooltip: `View ${name || title.singular}`,
    onClick: () => setPanel(foundIn, { value: sysId }),
  }
}

function emailAction<T extends IncludeByProp<'email'>>(item: T) {
  const { email } = item
  if (!(email && emailValidator(email))) return
  return {
    icon: 'mdi-email-fast',
    tooltip: 'Email',
    onClick: () => sendEmail(email)
  }
}

const isSelected = computed(() => {
  const selectedItems = getSelectedItems()
  if (!selectedItems) return false
  return selectedItems.map((item) => item.sysId).includes(props.item.sysId)
})

const isPinned = computed(() => {
  return !!useSheetManager().getPinnedItem(props.item)
})

const togglePin = () => {
  const { removePinnedItem: remove, addPinnedItem: add } = useSheetManager()
  isPinned.value ? remove(props.item) : add(props.item)
}

const dragStart = () => {
  useSheetManager().listItemBeingDragged = props.item
}

const setHovered = (v: boolean) => {
  if (!mdAndUp.value) {
    return
  }
  hovered.value = v
}

const hoverData = ref<Record<string, boolean>>({})

type SidebarActionButton<T extends SheetItem = SheetItem> = (item: T) => {
  icon: string,
  tooltip: string,
  onClick: (...args: any) => void,
  disableInReadOnlyMode?: boolean
} | undefined

type PanelSpecificActions = {
  [K in PanelName]: SidebarActionButton<PanelToSheetType[K]>
}

// quick actions for each panel
const panelSpecificActions: PanelSpecificActions = {
  'STUDENTS': emailAction,
  'GRADUATES': emailAction,
  'MODULES': jumpToProfileAction,
  'COMPLETED_MODULES': jumpToProfileAction,
  'THESES': jumpToProfileAction,
  'GRADUATE_ENGAGEMENTS': jumpToProfileAction,
}

const deleteAction: SidebarActionButton = () => ({
  icon: 'mdi-delete',
  tooltip: 'Delete',
  onClick: () => {
    deleteItem({
      item: props.item
    })
  },
  disableInReadOnlyMode: true
})

const sidebarActionButtons = computed(() => {
  const panelSpecificAction = panelSpecificActions[getActivePanel.value.panelName]
  const actionFns = [panelSpecificAction, deleteAction]

  const actions = actionFns.map((actionFn) => actionFn(props.item))
  const filteredActions = actions.filter((actionObj) => {
    if (!actionObj) return false
    if (actionObj.disableInReadOnlyMode && readOnlyMode.value) return false
    return true
  }) as Exclude<ReturnType<SidebarActionButton>, undefined>[]

  return filteredActions
})
</script>

<style scoped>
.item-card {
  width: 100%;
  background: rgba(255,255,255, 0.5);
  padding: 10px;
  cursor: pointer;
  transition: 350ms;
  border-bottom: 1px solid rgba(111, 111, 111, 0.21);
}

.selected-item-card {
  background: rgba(255,255,255, 1);
}

.item-card:hover {
  background: rgba(255,255,255, 1);
}
</style>