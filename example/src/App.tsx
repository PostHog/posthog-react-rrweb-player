import React, { useEffect, useMemo, useRef, useState } from 'react'

import { EventIndex, formatTime, PlayerRef, PlayerContextProvider, PlayerController, PlayerFrame } from '@posthog/react-rrweb-player'
import useLocalStorageState from 'use-local-storage-state'
import Select from 'react-select'
import { eventWithTime } from 'rrweb/typings/types'

import '@posthog/react-rrweb-player/dist/index.css'
import 'rc-tooltip/assets/bootstrap.css'

const makeOption = (label: string) => ({ value: window.location.pathname + label, label })

const RECORDINGS = [
  makeOption('docs.json'),
  makeOption('local-docs.json'),
  makeOption('homepage.json'),
  makeOption('mobile-homepage.json'),
  makeOption('wide-layout.json'),
  makeOption('with-pageviews.json')
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
  const [recordingMetadata] = useMemo(() => eventIndex.getRecordingMetadata(playerTime), [eventIndex, playerTime])
  const pageVisitEvents = useMemo(() => eventIndex.pageChangeEvents(), [eventIndex])

  return (
    <div>
      <div style={{ height: '80vh', width: '90vw' }}>
        {events.length > 0 && (
            <PlayerContextProvider
                ref={playerRef}
                events={events}
                key={activeRecording.value}
                onPlayerTimeChange={setCurrentPlayerTime}
                onNext={() => {
                    console.log('next recording...')
                }}
                onPrevious={() => {
                    console.log('previous recording...')
                }}
                duration={events.length > 0 ? (events.slice(-1)[0].timestamp - events[0].timestamp) : 0}
                isBuffering={false}
            >
                <PlayerFrame />
                <PlayerController />
            </PlayerContextProvider>
        )}
      </div>

      <div style={{ zIndex: 100, marginTop: 16, width: '300px' }}>
        <Select
          options={RECORDINGS}
          value={recording}
          onChange={(recording) => setRecording(recording as any)}
        />

        <pre>{JSON.stringify(pageEvent)}</pre>
        <pre>{JSON.stringify(recordingMetadata)}</pre>
      </div>

      <ul style={{ width: '50vw' }}>
        {pageVisitEvents.map((event, index) => (
          <li key={index}>
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
