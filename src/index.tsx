import React, { useEffect, useRef, useState } from 'react'
import Slider from 'rc-slider/lib/Slider'
import { FaBackward, FaExpand, FaPause, FaPlay } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import { Replayer } from 'rrweb'
import screenfull from 'screenfull'
import { eventWithTime, playerMetaData } from 'rrweb/typings/types'
import useLocalStorageState from 'use-local-storage-state'

import { formatTime } from './time'
import { PlayPauseOverlay } from './PlayPauseOverlay'

import './styles.css'
import 'rc-slider/assets/index.css'
import 'rrweb/dist/rrweb.min.css'
import { PlayerFrame } from './PlayerFrame'

const JUMP_TIME_MS = 8_000

interface Props {
    events: eventWithTime[]
}

export function Player(props: Props) {
    const [playing, setPlaying] = useState(true)
    const [skipping, setSkipping] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [meta, setMeta] = useState<playerMetaData>({
        startTime: 0,
        endTime: 0,
        totalTime: 0
    })

    const [speed, setSpeed] = useLocalStorageState('ph-rrweb-player-speed', 1)

    const frame = useRef<HTMLDivElement>(null)
    const wrapper = useRef<HTMLDivElement>(null)

    const replayer = useRef<Replayer | null>(null)
    const timer = useRef<number>()

    useEffect(() => {
        if (frame.current) {
            replayer.current = new Replayer(props.events, {
                root: frame.current,
                skipInactive: true,
                speed
            })

            replayer.current.on('finish', pause)
            replayer.current.on('skip-start', () => setSkipping(true))
            replayer.current.on('skip-end', () => setSkipping(false))

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

    useEffect(() => {
        if (replayer.current) {
            replayer.current.setConfig({ speed })
        }
    }, [speed])

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
        setSkipping(false)
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
            <div className='ph-rrweb-player' onClick={playing ? pause : play}>
                <PlayerFrame replayer={replayer.current} frame={frame} />
                <div className='ph-rrweb-overlay'>
                    {skipping && (
                        <div className='ph-rrweb-skipping'>
                            Skipping inactivity...
                        </div>
                    )}

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
                            {[1, 2, 4, 8, 16].map((speedToggle) => (
                                <span
                                    key={speedToggle}
                                    className='ph-rrweb-speed-toggle'
                                    style={{
                                        fontWeight:
                                            speedToggle === speed
                                                ? 'bold'
                                                : 'normal'
                                    }}
                                    onClick={() => setSpeed(speedToggle)}
                                >
                                    {speedToggle}x
                                </span>
                            ))}
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
