import { EventType, eventWithTime } from 'rrweb/typings/types'
import sortedLastIndexBy from 'lodash.sortedlastindexby'

export interface PageMetadata {
    href: string
    width: number
    height: number
}

export class EventIndex {
    events: eventWithTime[]
    _cachedMetadataEvents: eventWithTime[]

    constructor(events: eventWithTime[]) {
        this.events = events
    }

    getMetadata = (timestamp: number): PageMetadata | null => {
        const index =
            sortedLastIndexBy(
                this.metadataEvents(),
                { timestamp } as any,
                'timestamp'
            ) - 1

        if (index < 0 && index >= this.metadataEvents().length) {
            return null
        }
        return this.metadataEvents()[index].data as PageMetadata
    }

    metadataEvents = (): eventWithTime[] => {
        this._cachedMetadataEvents =
            this._cachedMetadataEvents ||
            this.events.filter(({ type }) => type === EventType.Meta)
        return this._cachedMetadataEvents
    }
}
