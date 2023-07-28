<template>
  <div style="height: 100%; position: relative">
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
          <div
            v-for="(account, i) in accounts.slice(0, 2)"
            :key="account.id"
            class="mr-2"
            :style="{
              transform: `translateY(${i * -15}px)`,
              width: '30px',
              height: '100%',
              borderRadius: '50%',
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
        <div style="width: 100%">
          <slot></slot>
        </div>
      </div>
    </div>
    <div
      v-else
      @dragstart="dragStart"
      @dragend="useSheetManager().listItemBeingDragged = null"
      :draggable="mdAndUp && !isSelected"
    >
      <slot></slot>
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
import { useAuth } from '../../store/useAuth'
import { storeToRefs } from 'pinia'

const { mdAndUp } = useDisplay()

const { getActivePanel, activateListTransition, setPanel } = useSheetManager()
const { getSelectedItems, deleteItem } = useDocumentCache()
const { focusData, getConnectedAccounts } = storeToRefs(useAuth())

const accounts = computed(() => {
  return getConnectedAccounts.value.filter(({ socketId }) => {
    const sysIdAccountIsFocusedOn = focusData.value[socketId]?.sysId;
    return sysIdAccountIsFocusedOn === props.item.sysId
  });
})

const hovered = ref(false)

const props = defineProps<{
  item: SheetItem,
  styled?: boolean
}>()

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
  if (isPinned.value) {
    activateListTransition()
    useSheetManager().removePinnedItem(props.item)
  } else {
    activateListTransition()
    useSheetManager().addPinnedItem(props.item)
  }
}

const dragStart = () => {
  useSheetManager().listItemBeingDragged = props.item
}

const canEmail = computed(() => {
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

const panelSpecificActions: { [key in PanelName]: SidebarActionButton } = {
  'STUDENTS': {
    condition: () => canEmail.value,
    icon: 'mdi-email-fast',
    tooltip: 'Email',
    onClick: () => {
      sendEmail(props.item?.email)
    }
  },
  'GRADUATES': {
    condition: () => canEmail.value,
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
      if (!studentMatch.value.sysId) return
      setPanel(studentMatch.value.foundIn, {
        value: studentMatch.value.sysId,
      })
    }
  },
  'COMPLETED_MODULES': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      if (!studentMatch.value.sysId) return
      setPanel(studentMatch.value.foundIn, {
        value: studentMatch.value.sysId,
      })
    }
  },
  'THESES': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      if (!studentMatch.value.sysId) return
      setPanel(studentMatch.value.foundIn, {
        value: studentMatch.value.sysId,
      })
    }
  },
  'GRADUATE_ENGAGEMENTS': {
    condition: () => !studentMatch.value.error,
    icon: getPanel(studentMatch.value.foundIn || 'STUDENTS').icon,
    tooltip: `View ${studentMatch.value.name || getPanel(studentMatch.value.foundIn || 'STUDENTS').title.singular}`,
    onClick: () => {
      if (!studentMatch.value.sysId) return
      setPanel(studentMatch.value.foundIn, {
        value: studentMatch.value.sysId,
      })
    }
  }
}

const sidebarActionButtons = computed(() => {
  const panelSpecificAction = panelSpecificActions[getActivePanel.panelName]

  const deleteAction: SidebarActionButton = {
    icon: 'mdi-delete',
    tooltip: 'Delete',
    onClick: () => {
      deleteItem({
        item: props.item
      })
    }
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