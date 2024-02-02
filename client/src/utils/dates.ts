import { formatTimeAgo } from "@vueuse/core";

export const timeAgoDayPrecision = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const greaterThan24Hours = today.getTime() - date.getTime() > 86_400_000;

  if (greaterThan24Hours) {
    return formatTimeAgo(date);
  } else if (date.getTime() < today.getTime()) {
    return 'today';
  }

  return 'in the future';
}

// 1/31/2021 -> January 31, 2021 (time ago)
export const fullDate = (dateString: string) => {
  const date = new Date(dateString);
  let fullDateString = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (fullDateString === 'Invalid Date') {
    return '';
  }

  const timeAgo = timeAgoDayPrecision(dateString);
  return `${fullDateString} (${timeAgo})`;
}


export const daysSinceDate = (date: string) => {
  const now = new Date()
  try {
    const created = new Date(date)
    const diff = now.getTime() - created.getTime()
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (isNaN(diffDays)) {
      return 'On A Date That Is Not Valid 🫣'
    } else if (diffDays === 1) {
      return 'Today'
    } else if (diffDays === 2) {
      return 'Yesterday'
    } else if (diffDays === 0) {
      return 'Tomorrow 😱'
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays) + 1} Days In The Future... 🤯`
    } else {
      return `${diffDays - 1} Days Ago`
    }
  } catch (e) {
    console.warn(e)
    return 0
  }
}