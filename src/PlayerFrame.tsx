import React, { RefObject, useEffect, useRef } from 'react'
import { Replayer } from 'rrweb'
import { viewportResizeDimention } from 'rrweb/typings/types'

interface Props {
    replayer: Replayer | null
    frame: RefObject<HTMLDivElement>
}

export function PlayerFrame({ replayer, frame }: Props) {
    const replayDimensionRef = useRef<viewportResizeDimention>()

    useEffect(() => {
        if (!replayer) {
            return
        }

        replayer.on('resize', updatePlayerDimensions)
        window.addEventListener('resize', windowResize)

        return () => window.removeEventListener('resize', windowResize)
    }, [replayer])

    const windowResize = () => {
        updatePlayerDimensions(replayDimensionRef.current)
    }

    // :TRICKY: Scale down the iframe and try to position it vertically
    const updatePlayerDimensions = (
        replayDimensions: viewportResizeDimention | undefined
    ) => {
        if (!replayDimensions) {
            return
        }

        replayDimensionRef.current = replayDimensions
        const {
            width,
            height
        } = frame.current!.parentElement!.getBoundingClientRect()

        const scale = Math.min(
            width / replayDimensions.width,
            height / replayDimensions.height,
            1
        )

        replayer!.wrapper.style.transform = `scale(${scale})`
        frame.current!.style.paddingLeft = `${
            (width - replayDimensions.width * scale) / 2
        }px`
        frame.current!.style.paddingTop = `${
            (height - replayDimensions.height * scale) / 2
        }px`
    }

    return <div ref={frame} />
}
