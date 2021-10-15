import React, { useContext, useEffect, useRef } from 'react'
import { viewportResizeDimension } from 'rrweb/typings/types'
import { PlayPauseOverlay } from './PlayPauseOverlay'
import { PlayerContext } from './PlayerContext'

export function PlayerFrame() {
    const replayDimensionRef = useRef<viewportResizeDimension>()

    const context = useContext(PlayerContext)

    if (!context) {
        // PlayerController must be wrapped by a Provider
        return null
    }

    const {
        playing,
        togglePlayPause,
        replayer,
        frame,
        skipping,
        setFrameRef
    } = context

    useEffect(() => {
        if (!replayer.current) {
            return
        }

        replayer.current!.on('resize', updatePlayerDimensions)
        window.addEventListener('resize', windowResize)

        return () => window.removeEventListener('resize', windowResize)
    }, [replayer.current])

    const windowResize = () => {
        updatePlayerDimensions(replayDimensionRef.current)
    }

    // :TRICKY: Scale down the iframe and try to position it vertically
    const updatePlayerDimensions = (
        replayDimensions: viewportResizeDimension | undefined
    ) => {
        if (!replayDimensions || !frame) {
            return
        }

        replayDimensionRef.current = replayDimensions
        const { width, height } = frame.parentElement!.getBoundingClientRect()

        const scale = Math.min(
            width / replayDimensions.width,
            height / replayDimensions.height,
            1
        )

        replayer.current!.wrapper.style.transform = `scale(${scale})`
        frame.style.paddingLeft = `${
            (width - replayDimensions.width * scale) / 2
        }px`
        frame.style.paddingTop = `${
            (height - replayDimensions.height * scale) / 2
        }px`
    }

    return (
        <div className='ph-rrweb-player' onClick={togglePlayPause}>
            <div ref={(ref) => setFrameRef(ref)} />
            <div className='ph-rrweb-overlay'>
                {skipping && (
                    <div className='ph-rrweb-skipping'>
                        Skipping inactivity...
                    </div>
                )}

                <PlayPauseOverlay playing={playing} />
            </div>
        </div>
    )
}
