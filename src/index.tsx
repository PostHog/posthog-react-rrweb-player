import React, { useEffect, useRef, useState } from 'react'
import Slider from 'rc-slider/lib/Slider'
import { FaBackward, FaExpand, FaPause, FaPlay } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import { Replayer } from 'rrweb'
import screenfull from 'screenfull'
import {
    eventWithTime,
    playerMetaData,
    viewportResizeDimention
} from 'rrweb/typings/types'

import { formatTime } from './time'
import { PlayPauseOverlay } from './PlayPauseOverlay'

import './styles.css'
import 'rc-slider/assets/index.css'
import 'rrweb/dist/rrweb.min.css'

const JUMP_TIME_MS = 8_000

interface Props {
    events: eventWithTime[]
}

export function Player(props: Props) {
    const [playing, setPlaying] = useState(true)
    const [currentTime, setCurrentTime] = useState(0)
    const [meta, setMeta] = useState<playerMetaData>({
        startTime: 0,
        endTime: 0,
        totalTime: 0
    })

    const frame = useRef<HTMLDivElement>(null)
    const wrapper = useRef<HTMLDivElement>(null)

    const replayer = useRef<Replayer>()
    const replayDimensionRef = useRef<viewportResizeDimention>()
    const timer = useRef<number>()

    useEffect(() => {
        if (frame.current) {
            replayer.current = new Replayer(props.events, {
                root: frame.current,
                speed: 1,
                skipInactive: true
            })

            window.addEventListener('resize', () =>
                updatePlayerDimensions(replayDimensionRef.current!)
            )
            replayer.current.on('resize', updatePlayerDimensions)
            // replayer.current.on('start', startTimeLoop)
            // replayer.current.on('resume', startTimeLoop)
            // replayer.current.on('pause', stopTimeLoop)
            // replayer.current.on('finish', stopTimeLoop)
            replayer.current.on('finish', pause)

            replayer.current.play()

            const meta = replayer.current.getMetaData()

            setPlaying(true)
            setMeta(meta)

            wrapper.current!.focus()

            // @ts-ignore
            window.replayer = replayer.current
        }

        return () => {
            stopTimeLoop()
            replayer.current!.pause()
        }
    }, [])

    useEffect((): any => {
        stopTimer()

        if (playing && meta.totalTime > 0) {
            updateTime()
            return () => stopTimer()
        }
    }, [playing, meta])

    const stopTimer = () => {
        if (timer.current) {
            cancelAnimationFrame(timer.current)
        }
    }

    const updateTime = () => {
        const currentTime = Math.min(
            replayer.current!.getCurrentTime(),
            meta.totalTime
        )
        setCurrentTime(currentTime)

        timer.current = requestAnimationFrame(updateTime)
    }

    const updatePlayerDimensions = (
        replayDimensions: viewportResizeDimention
    ) => {
        replayDimensionRef.current = replayDimensions
        const { width } = frame.current!.getBoundingClientRect()

        const scale = Math.min(width / replayDimensions.width, 1)
        replayer.current!.wrapper.style.transform = `scale(${scale})`
    }

    const stopTimeLoop = () => {
        if (timer.current) {
            cancelAnimationFrame(timer.current)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === ' ') {
            if (playing) {
                pause()
            } else {
                play()
            }
        } else if (event.key === 'ArrowLeft') {
            seek(currentTime - JUMP_TIME_MS / 2)
        } else if (event.key === 'ArrowRight') {
            seek(currentTime + JUMP_TIME_MS / 2)
        } else if (event.key === 'f') {
            toggleFullScreen()
        }
    }

    const play = () => {
        setPlaying(true)
        replayer.current!.play(currentTime)
    }

    const pause = () => {
        setPlaying(false)
        replayer.current!.pause()
    }

    const seek = (time: number) => {
        time = Math.max(Math.min(time, meta.totalTime), 0)
        replayer.current!.play(time)
        setCurrentTime(time)
        if (!playing) {
            replayer.current!.pause()
        }
    }

    const seekBack = () => {
        seek(currentTime - JUMP_TIME_MS)
    }

    const toggleFullScreen = () => {
        if (screenfull.isEnabled && wrapper.current) {
            screenfull.toggle(wrapper.current)
        }
    }

    return (
        <div
            className='ph-rrweb-wrapper'
            ref={wrapper}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div
                className='ph-rrweb-frame'
                ref={frame}
                onClick={playing ? pause : play}
            >
                <div className='ph-rrweb-overlay'>
                    <PlayPauseOverlay playing={playing} />
                </div>
            </div>
            <div className='ph-rrweb-bottom'>
                <div className='ph-rrweb-progress'>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={meta.totalTime}
                        step={0.01}
                        onChange={seek}
                    />
                </div>
                <div className='ph-rrweb-controller'>
                    <IconContext.Provider
                        value={{
                            className: 'ph-rrweb-controller-icon'
                        }}
                    >
                        <div>
                            {playing ? (
                                <FaPause onClick={pause} />
                            ) : (
                                <FaPlay onClick={play} />
                            )}
                            <FaBackward onClick={seekBack} />
                            {formatTime(currentTime)} /{' '}
                            {formatTime(meta.totalTime)}
                        </div>
                        <div style={{ justifyContent: 'flex-end' }}>
                            {screenfull.isEnabled && (
                                <FaExpand onClick={toggleFullScreen} />
                            )}
                        </div>
                    </IconContext.Provider>
                </div>
            </div>
        </div>
    )
}
