import type { IncludeByProp } from '@apptypes/sheetItems'
import { matchStudent } from '../../StudentMatcher'
import { emailValidator, sendEmail } from '@utils/emails'
import { getPanel } from '@panels'
import { useSheetManager } from '@store/useSheetManager'

export function jumpToProfileAction<T extends IncludeByProp<'studentSysId'>>(item: T) {
  const match = matchStudent(item.studentSysId)
  const { setPanel } = useSheetManager()
  if ('error' in match) return

  const { foundIn, name, sysId } = match
  const { icon, title } = getPanel(foundIn)

  return {
    icon: (isHovered: boolean) => isHovered ? icon : `${icon}-outline`,
    tooltip: `View ${name || title.singular}`,
    onClick: () => setPanel(foundIn, { value: sysId }),
    actionId: 'jump-to-profile'
  } as const
}

export function emailAction<T extends IncludeByProp<'email'>>(item: T) {
  const { email } = item
  if (!(email && emailValidator(email))) return
  return {
    icon: (isHovered: boolean) => isHovered ? 'mdi-email-fast' : 'mdi-email-fast-outline',
    tooltip: 'Email',
    onClick: () => sendEmail(email),
    actionId: 'email'
  } as const
}