import React from 'react'

import { Player } from 'posthog-react-rrweb-player'
import 'posthog-react-rrweb-player/dist/index.css'

const events: any = JSON.parse(localStorage.getItem('session')!).result

const App = () => (
  <div style={{ height: '90vh', width: '90vw' }}>
    <Player events={events} />
  </div>
)

export default App
