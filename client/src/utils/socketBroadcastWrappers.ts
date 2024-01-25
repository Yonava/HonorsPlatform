import { useSocket } from "@store/useSocket";
import type { SheetItem } from "../SheetTypes";

export function broadcastPropUpdate<T extends SheetItem>(item: T) {
  const { emitUserAction } = useSocket()

  return (prop: keyof T) => {
    const value = item[prop]
    const { sysId } = item

    emitUserAction({
      action: 'prop-update',
      payload: {
        sysId,
        prop,
        value
      }
    })
  }
}