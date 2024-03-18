import { useDialog } from '@store/useDialog';
import DuplicateSysIdRemediation from '../components/DuplicateSysIdRemediation.vue';

const title = 'Important Message!';

const description = `This program uses a unique identifier for every item in the system called a sysId. This sysId is used for essential tasks including managing the addition and deletion of data associated with the item. If you are reading this message, it means that there are two or more items with the same sysId which can lead to serious consequences such as data loss for the items using duplicate identifiers. We strongly encourage remediating this issue before continuing.`;

export const serveDupSysIdDialog = () => useDialog().open({
  title,
  description,
  buttons: [
    {
      text: 'Ignore & Continue',
      onClick: () => {
        useDialog().close();
      },
      color: 'red'
    },
    {
      text: 'Remediate',
      onClick: () => {
        useDialog().open({
          persistent: true,
          component: DuplicateSysIdRemediation
        });
      },
      color: 'green'
    }
  ]
});