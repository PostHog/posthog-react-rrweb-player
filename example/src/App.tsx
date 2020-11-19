import React, { useEffect, useState } from 'react'

import { Player } from 'posthog-react-rrweb-player'
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

  useEffect(() => {
      async function fetchRecording() {
        const response = await fetch(recording.value)
        const { result } = await response.json()

        setEvents(result)
        setActiveRecording(recording)
    }

    fetchRecording()
  }, [recording])

  return (
    <div style={{ height: '90vh', width: '90vw' }}>
      <div style={{ zIndex: 100 }}>
        <Select
          options={RECORDINGS}
          value={recording}
          onChange={(recording) => setRecording(recording as any)}
        />
      </div>

      <br />

      {events.length > 0 && <Player events={events} key={activeRecording.value} />}
    </div>
  )
}

export default App
