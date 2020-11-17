import React from 'react'

import { Player } from 'posthog-react-rrweb-player'
import 'posthog-react-rrweb-player/dist/index.css'

const App = () => (
  <div style={{ height: '90vh', width: '90vw' }}>
    <Player />
  </div>
)

export default App
