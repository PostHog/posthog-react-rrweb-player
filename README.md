# @posthog/react-rrweb-player

> React-based player for rrweb

[![NPM](https://img.shields.io/npm/v/@posthog/react-rrweb-player.svg)](https://www.npmjs.com/package/@posthog/react-rrweb-player) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save @posthog/react-rrweb-player
```

## Usage

```tsx
import React, { Component } from 'react'

import { EventIndex, formatTime, PlayerRef, PlayerContextProvider, PlayerController, PlayerFrame } from '@posthog/react-rrweb-player'
import '@posthog/react-rrweb-player/dist/index.css'

class Example extends Component {
    render() {
        return (
            <PlayerContextProvider
                ref={ref}
                events={events}
                key={recording.key}
                onPlayerTimeChange={() => {}}
                onNext={() => {}}
                onPrevious={() => {}}
                duration={duration}
                isBuffering={false}
            >
                <PlayerFrame />
                <PlayerController />
            </PlayerContextProvider>
        )
    }
}
```

## Developing locally

To develop locally, you can run the following commands and an example app will be launched on port 3000.

```bash
yarn # only the first time to install dependencies
yarn start # to run the base component
cd example
yarn start # to run the example project
```

## Questions?

### [Join our Slack community.](http://posthog.com/slack)
