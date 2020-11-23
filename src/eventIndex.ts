import { eventWithTime } from 'rrweb/typings/types'
import sortedLastIndexBy from 'lodash.sortedlastindexby'

export interface PageMetadata {
    href: string
    playerTime: number
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

    getPageMetadata = (playerTime: number): PageMetadata | null => {
        const timestamp = playerTime + this.baseTime
        const index =
            sortedLastIndexBy(
                this.pageChangeEvents(),
                { timestamp } as any,
                'timestamp'
            ) - 1

        if (index < 0 || index >= this.pageChangeEvents().length) {
            return null
        }
        return this.pageChangeEvents()[index]
    }

    pageChangeEvents = (): PageMetadata[] => {
        return this._filterBy('href', (event) => ({
            href: (event.data as { href: string }).href,
            playerTime: event.timestamp - this.baseTime
        }))
    }

    _filterBy = <T>(
        dataKey: string,
        transformer: (e: eventWithTime) => T
    ): T[] => {
        if (!this._filterByCaches[dataKey]) {
            this._filterByCaches[dataKey] = this.events
                .filter(({ data }) => dataKey in data)
                .map(transformer)
        }
        return this._filterByCaches[dataKey] as T[]
    }
}
