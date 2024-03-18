import type { SheetItem } from "@apptypes/sheetItems"
import type { PanelName } from "@panels"
import { useSheetManager } from "@store/useSheetManager"
import { setSelectedItem } from "../components/Panel/SetSelectedItem"

// addItemCache(item: types.SheetItem, panelName: PanelName) {
//   const { activateListTransition, getActivePanel } = useSheetManager();
//   if (panelName === getActivePanel.panelName) {
//     activateListTransition();
//   }
//   const { sheetRange } = panels[panelName];
//   this[sheetRange].list.unshift(item);
// },

const add = async () => {
  const { panel, newSysId, setSearchFilter } = useSheetManager();
  const itemSysId = newSysId();
  const [ newItem ] = await panel.mappers.map([[itemSysId]]);
  newItem.row = null;
  setSearchFilter("");
  setSelectedItem(newItem);
}
