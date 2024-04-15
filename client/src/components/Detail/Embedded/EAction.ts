import { useSheetManager } from '@store/useSheetManager';
import { storeToRefs } from 'pinia';
import type { SheetItem } from '@apptypes/sheetItems';

export type Action<T> = {
  icon: (hovered: boolean) => string;
  tooltip: string;
  onClick: (item: T) => void;
  disableInReadOnlyMode?: boolean;
}

export const useActions = <T extends SheetItem>(remove: Action<T>['onClick']) => {
  const { setPanel } = useSheetManager();
  const { getActiveEmbeddedPanel } = storeToRefs(useSheetManager());
  return [
    {
      icon: (hovered: boolean) => hovered ? 'mdi-arrow-right-bold-box' : 'mdi-arrow-right-bold-box-outline',
      tooltip: `View In ${getActiveEmbeddedPanel.value!.title.plural}`,
      onClick: (item: T) => setPanel(getActiveEmbeddedPanel.value!.panelName, {
        value: item.sysId
      })
    },
    {
      icon: (hovered: boolean) => hovered ? 'mdi-delete' : 'mdi-delete-outline',
      tooltip: 'Delete',
      onClick: remove
    }
  ]
}