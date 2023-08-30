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
            v-for="{ icon, onClick, tooltip, condition = () => true } in sidebarActionButtons"
            :key="icon"
            @click.stop="onClick"
            @mouseover="hoverData[icon] = true"
            @mouseleave="hoverData[icon] = false"
          >

            <v-icon
              v-if="condition()"
            >
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
          <LIBottomCorner :data="bottomCornersUsingSort" />
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
        <LIBottomCorner :data="bottomCornersUsingSort" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { SheetItem } from '../../SheetTypes'
import { emailValidator, sendEmail } from '../../EmailUtilities'
import { useSheetManager } from '../../store/useSheetManager'
import { useDocumentCache } from '../../store/useDocumentCache'
import { useDisplay } from 'vuetify'
import { ref, computed } from 'vue'
import { useStudentMatcher } from '../../StudentMatcher'
import { getPanel, PanelName } from '../../Panels'
import { storeToRefs } from 'pinia'
import { useSocket } from '../../store/useSocket'
import { LIBottomCorner } from './ListItemParts/ListItemExports'

type CornerData = {
  text: string,
  icon: string,
  // property in item being displayed
  prop?: string,
  // if true, text will appear in an error state (red)
  error?: boolean,
  // text on tooltip
  tooltip?: string,
}

const sheetManager = useSheetManager()
const { activateListTransition, setPanel } = useSheetManager()
const { getActivePanel, activeSort } = storeToRefs(sheetManager)

const props = defineProps<{
  item: SheetItem,
  bottomCorners: [CornerData] | [CornerData, CornerData]
  styled?: boolean
}>()

const displayedProps: { [key in PanelName]: string[] } = {
  STUDENTS: [
    'name',
    'id',
    'athletics',
    'email',
    'activeStatus',
    'year'
  ],
  GRADUATES: [
    'name',
    'id',
    'phone',
    'email',
  ],
  GRADUATE_ENGAGEMENTS: [],
  MODULES: [
    'courseCode',
    'term',
    'instructor',
    'studentSysId',
    'docuSignCreated',
    'docuSignCompleted'
  ],
  COMPLETED_MODULES: [
    'grade',
    'term',
    'courseCode',
    'completedDate',
    'studentSysId'
  ],
  THESES: [
    'mentor',
    'title',
    'term',
    'studentSysId',
    'decision'
  ],
}

const bottomCornersUsingSort = computed(() => {

  const { prop: sortProp, label: sortLabel } = activeSort.value
  const { panelName, propIcons } = getActivePanel.value

  const sortPropItem = {
    text: props.item[sortProp] || '(None)',
    icon: propIcons[sortProp] || 'mdi-sort',
    tooltip: sortLabel
  }

  if (!activeSort.value.prop || displayedProps[panelName].includes(sortProp)) {
    return props.bottomCorners
  } else if (props.bottomCorners.length === 2) {
    return [
      sortPropItem,
      props.bottomCorners[1],
    ]
  } else if (props.bottomCorners.length === 1) {
    return [
      sortPropItem,
      props.bottomCorners[0],
    ]
  } else {
    return [sortPropItem]
  }
})

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

const { studentMatch } = useStudentMatcher(props.item?.studentSysId)

const isSelected = computed(() => {
  const selectedItems = getSelectedItems()
  if (!selectedItems) return false
  return selectedItems.map((item) => item.sysId).includes(props.item.sysId)
})

const isPinned = computed(() => {
  return !!useSheetManager().getPinnedItem(props.item)
})

const togglePin = () => {
  const { removePinnedItem, addPinnedItem } = useSheetManager()
  if (isPinned.value) {
    activateListTransition()
    removePinnedItem(props.item)
  } else {
    activateListTransition()
    addPinnedItem(props.item)
  }
}

const dragStart = () => {
  useSheetManager().listItemBeingDragged = props.item
}

const canEmail = computed(() => {
  if (!('email' in props.item)) {
    return false
  }
  const email = props.item?.email
  return email && emailValidator(email)
})

const setHovered = (v: boolean) => {
  if (!mdAndUp.value) {
    return
  }
  hovered.value = v
}

const hoverData = ref<{ [key in string]: boolean }>({})

type SidebarActionButton = {
  icon: string,
  tooltip: string,
  onClick: () => void,
  condition?: () => boolean
}

// quick actions for each panel
const panelSpecificActions: { [key in PanelName]: SidebarActionButton } = {
  'STUDENTS': {
    condition: () => !!canEmail.value,
    icon: 'mdi-email-fast',
    tooltip: 'Email',
    onClick: () => {
      sendEmail(props.item?.email)
    }
  },
  'GRADUATES': {
    condition: () => !!canEmail.value,
    icon: 'mdi-email-fast',
    tooltip: 'Email',
    onClick: () => {
      sendEmail(props.item?.email)
    }
  },
  'MODULES': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      const { sysId, foundIn } = studentMatch.value
      if (!sysId || !foundIn) {
        return
      }
      setPanel(foundIn, {
        value: sysId,
      })
    }
  },
  'COMPLETED_MODULES': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      const { sysId, foundIn } = studentMatch.value
      if (!sysId || !foundIn) {
        return
      }
      setPanel(foundIn, {
        value: sysId,
      })
    }
  },
  'THESES': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      const { sysId, foundIn } = studentMatch.value
      if (!sysId || !foundIn) {
        return
      }
      setPanel(foundIn, {
        value: sysId,
      })
    }
  },
  'GRADUATE_ENGAGEMENTS': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      const { sysId, foundIn } = studentMatch.value
      if (!sysId || !foundIn) {
        return
      }
      setPanel(foundIn, {
        value: sysId,
      })
    }
  }
}

const sidebarActionButtons = computed(() => {
  const panelSpecificAction = panelSpecificActions[getActivePanel.value.panelName]

  const deleteAction: SidebarActionButton = {
    icon: 'mdi-delete',
    tooltip: 'Delete',
    onClick: () => {
      deleteItem({
        item: props.item
      })
    }
  }

  if (readOnlyMode.value) {
    return panelSpecificAction ? [panelSpecificAction] : []
  }

  return panelSpecificAction ? [panelSpecificAction, deleteAction] : [deleteAction]
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