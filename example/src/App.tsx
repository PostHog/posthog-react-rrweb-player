import React, { useEffect, useMemo, useState } from 'react'

import { EventIndex, Player } from 'posthog-react-rrweb-player'
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
  const pageEvent = useMemo(() => eventIndex.getPageMetadata(playerTime), [eventIndex, playerTime])

  return (
    <div>
      <div style={{ zIndex: 100 }}>
        <Select
          options={RECORDINGS}
          value={recording}
          onChange={(recording) => setRecording(recording as any)}
        />

        <pre>{JSON.stringify(pageEvent)}</pre>
      </div>

      <br />

      <div style={{ height: '80vh', width: '90vw' }}>
        {events.length > 0 && <Player events={events} key={activeRecording.value} onPlayerTimeChange={setCurrentPlayerTime} />}
      </div>
    </div>
  )
}

export default App
