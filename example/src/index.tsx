import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const render = async(url: string) => {
    const response = await fetch(url)
    const { result } = await response.json()
    ReactDOM.render(<App events={result} />, document.getElementById('root'))
}

render('/broken-recording.json')
