import { eventWithTime } from 'rrweb/typings/types'
import sortedLastIndexBy from 'lodash.sortedlastindexby'

export interface PageMetadata {
    href: string
}

export class EventIndex {
    events: eventWithTime[]
    baseTime: number
    _filterByCaches: { [key: string]: eventWithTime[] }

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
        return this.pageChangeEvents()[index].data as PageMetadata
    }

    pageChangeEvents = (): eventWithTime[] => {
        return this._filterBy('href')
    }

    _filterBy = (dataKey: string): eventWithTime[] => {
        if (!this._filterByCaches[dataKey]) {
            this._filterByCaches[dataKey] = this.events.filter(({ data }) => dataKey in data)
        }
        return this._filterByCaches[dataKey]
    }
}
