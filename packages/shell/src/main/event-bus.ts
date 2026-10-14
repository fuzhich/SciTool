import { webContents } from 'electron'
import { SDK_CHANNELS, type SharedDocEvent } from '@scitool/sdk'

interface Subscription {
  id: number
  webContentsId: number
  domain: string
}

let nextSubId = 1
const subscriptions = new Map<number, Subscription>()

export function subscribeEvents(webContentsId: number, domain: string): number {
  const id = nextSubId++
  subscriptions.set(id, { id, webContentsId, domain })
  return id
}

export function unsubscribeEvents(subscriptionId: number): void {
  subscriptions.delete(subscriptionId)
}

export function clearSubscriptionsForWebContents(webContentsId: number): void {
  for (const [id, sub] of subscriptions) {
    if (sub.webContentsId === webContentsId) subscriptions.delete(id)
  }
}

export function emitSharedDocEvent(event: SharedDocEvent): void {
  for (const sub of subscriptions.values()) {
    if (sub.domain !== event.doc.domain) continue
    const wc = webContents.fromId(sub.webContentsId)
    if (wc && !wc.isDestroyed()) {
      wc.send(SDK_CHANNELS.eventsNotify, { ...event, subscriptionId: sub.id })
    } else {
      subscriptions.delete(sub.id)
    }
  }
}
