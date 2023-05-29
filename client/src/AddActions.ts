import { useSheetManager } from './store/useSheetManager';
import { useDialog } from './store/useDialog';
import { postInRange, Range } from './SheetsAPI';
import { getPanel, PanelName } from './Panels'

export const add = async (panelName: PanelName, columns = [useSheetManager().newSysId()]) => {
  const { addItem } = useSheetManager();
  const { map } = getPanel(panelName).mappers;
  await postInRange(Range[panelName], [columns]);
  const newItem = await map([columns]);
  addItem(newItem[0]);
}

export const addActions = {
  STUDENTS: async () => await add('STUDENTS'),
  GRADUATES: async () => await add('GRADUATES'),
  MODULES: async () => null,
  COMPLETED_MODULES: async () => null,
  THESES: async () => {}
} as const;