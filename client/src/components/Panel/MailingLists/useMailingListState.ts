import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useDocumentCache } from "@store/useDocumentCache";

type Options = {
  initialRecipientSysIds?: string[];
  onToggleRecipient?: (sysId: string) => void;
}

export function useMailingListState(options: Options = {}) {

  const {
    initialRecipientSysIds = [],
    onToggleRecipient = () => {}
  } = options

  const { Students, Graduates } = storeToRefs(useDocumentCache());

  const potentialRecipients = computed(() => {
    return [
      ...Students.value.list,
      ...Graduates.value.list
    ]
  });

  const recipientSysIds = ref(new Set<string>(initialRecipientSysIds));

  const recipients = computed(() => {
    return potentialRecipients.value
      .filter((recipient) => recipientSysIds.value.has(recipient.sysId));
  });

  const toggleRecipient = (sysId: string) => {
    recipientSysIds.value.has(sysId)
      ? recipientSysIds.value.delete(sysId)
      : recipientSysIds.value.add(sysId);

    onToggleRecipient(sysId);
  }

  return {
    potentialRecipients,
    recipientSysIds,
    recipients,
    toggleRecipient
  }
}