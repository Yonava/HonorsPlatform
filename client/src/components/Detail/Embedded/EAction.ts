import { useSheetManager } from '@store/useSheetManager';
import { storeToRefs } from 'pinia';
import type { SheetItem } from '@apptypes/sheetItems';

/**
 * @description The type all embedded list item actions must conform to
 */
export type Action<T> = {
  icon: (hovered: boolean) => string;
  tooltip: string;
  onClick: (item: T) => void;
  disableInReadOnlyMode?: boolean;
}

/**
 * @description Returns a default set of actions for embedded list items
 * @param remove - The function to be executed when the delete action is fired
 * @returns
 * @example const actions = useActions((student: Student) => removeStudent(student.sysId));
 */
export const useActions = <T extends SheetItem>(removeFn: Action<T>['onClick']) => {
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
      onClick: removeFn
    }
  ]
}