import React, { useEffect, useMemo, useRef, useState } from 'react'

import { EventIndex, formatTime, Player, PlayerRef } from 'posthog-react-rrweb-player'
import useLocalStorageState from 'use-local-storage-state'
import Select from 'react-select'
import { eventWithTime } from 'rrweb/typings/types'

import 'posthog-react-rrweb-player/dist/index.css'

const makeOption = (value: string) => ({ value, label: value })

const RECORDINGS = [
  makeOption('/docs.json'),
  makeOption('/local-docs.json'),
  makeOption('/homepage.json'),
  makeOption('/mobile-homepage.json')
]

const App = () => {
  const [events, setEvents] = useState<eventWithTime[]>([])
  const [recording, setRecording] = useLocalStorageState('recording', RECORDINGS[0])
  const [activeRecording, setActiveRecording] = useState(recording)
  const [playerTime, setCurrentPlayerTime] = useState(0)

  const playerRef = useRef<PlayerRef>(null)

  useEffect(() => {
      async function fetchRecording() {
        const response = await fetch(recording.value)
        const { result } = await response.json()

        setEvents(result)
        setActiveRecording(recording)
    }

    fetchRecording()
  }, [recording])

  const eventIndex: EventIndex = useMemo(() => new EventIndex(events), [events])
  const [pageEvent, atPageIndex] = useMemo(() => eventIndex.getPageMetadata(playerTime), [eventIndex, playerTime])
  const pageVisitEvents = useMemo(() => eventIndex.pageChangeEvents(), [eventIndex])

  return (
    <div>
      <div style={{ height: '80vh', width: '90vw' }}>
        {events.length > 0 && (
          <Player
            ref={playerRef}
            events={events}
            key={activeRecording.value}
            onPlayerTimeChange={setCurrentPlayerTime}
            onNext={() => {}}
            onPrevious={() => {}}
          />
        )}
      </div>

      <div style={{ zIndex: 100, marginTop: 16, width: '300px' }}>
        <Select
          options={RECORDINGS}
          value={recording}
          onChange={(recording) => setRecording(recording as any)}
        />

        <pre>{JSON.stringify(pageEvent)}</pre>
      </div>

      <ul style={{ width: '50vw' }}>
        {pageVisitEvents.map((event, index) => (
          <li>
            <button onClick={() => playerRef.current && playerRef.current.seek(event.playerTime)}>
               {formatTime(event.playerTime)} - Visited {event.href}
            </button>
            {index === atPageIndex ? ' (Active)' : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
