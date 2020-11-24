import { eventWithTime } from 'rrweb/typings/types'

export interface PageMetadata {
    href: string
    playerTime: number
}

export interface LibCustomEvent {
    type: 5
    data: {
        tag: string
        payload: any
    }
}

export class EventIndex {
    events: eventWithTime[]
    baseTime: number
    _filterByCaches: { [key: string]: any[] }

    constructor(events: eventWithTime[]) {
        this.events = events
        this.baseTime = events.length > 0 ? events[0].timestamp : 0
        this._filterByCaches = {}
    }

    getPageMetadata = (
        playerTime: number
    ): [PageMetadata, number] | [null, -1] => {
        let index = this.pageChangeEvents().findIndex(
            (event) => event.playerTime >= playerTime
        )

        if (index === 0) {
            return [this.pageChangeEvents()[0], 0]
        } else if (index === -1) {
            index = this.pageChangeEvents().length - 1
            return [this.pageChangeEvents()[index], index]
        }
        return [this.pageChangeEvents()[index - 1], index - 1]
    }

    pageChangeEvents = (): PageMetadata[] => {
        return this._filterBy('href', (event) => {
            if ('href' in event.data) {
                return {
                    href: (event.data as { href: string }).href,
                    playerTime: event.timestamp - this.baseTime
                }
            }
            if (
                event.type === 5 &&
                (event as LibCustomEvent).data.tag === '$pageview'
            ) {
                return {
                    href: (event as LibCustomEvent).data.payload.href,
                    playerTime: event.timestamp - this.baseTime
                }
            }

            return null
        })
    }

    _filterBy = (
        dataKey: string,
        transformer: (e: eventWithTime) => PageMetadata | null
    ): PageMetadata[] => {
        if (!this._filterByCaches[dataKey]) {
            let lastHref: string | undefined

            this._filterByCaches[dataKey] = this.events
                .map(transformer)
                .filter((value) => !!value)
                .filter(({ href }: PageMetadata) => {
                    if (href !== lastHref) {
                        lastHref = href
                        return true
                    }
                    return false
                })
        }
        return this._filterByCaches[dataKey] as PageMetadata[]
    }
}
