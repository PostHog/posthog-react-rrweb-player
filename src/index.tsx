import React, {
    ForwardedRef,
    forwardRef,
    RefObject,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react'
import Slider from 'rc-slider/lib/Slider'
import {
    IconPlay,
    IconSeekBack,
    IconStepBackward,
    IconStepForward,
    IconFullscreen,
    IconPause
} from './icons'
import { Replayer } from 'rrweb'
import screenfull from 'screenfull'
import useLocalStorageState from 'use-local-storage-state'
import { useDebouncedCallback } from 'use-debounce'
import { eventWithTime, playerMetaData } from 'rrweb/typings/types'

import { formatTime } from './time'
import { PlayPauseOverlay } from './PlayPauseOverlay'
import { PlayerFrame } from './PlayerFrame'
import Tooltip from 'rc-tooltip'

import './styles.css'
import 'rc-slider/assets/index.css'
import 'rrweb/dist/rrweb.min.css'

export { EventIndex, findCurrent } from './eventIndex'
export { formatTime } from './time'

const JUMP_TIME_MS = 8_000
const PLAYBACK_SPEEDS = [1, 2, 4, 8, 16]
const NOOP = () => {}

interface Props {
    events: eventWithTime[]
    onPlayerTimeChange?: (playerTime: number) => void
    onPrevious?: () => void
    onNext?: () => void
}

export interface PlayerRef {
    replayer: RefObject<Replayer | null>
    seek: (playerTime: number) => void
}

export const Player = forwardRef<PlayerRef, Props>(function Player(
    props: Props,
    ref: ForwardedRef<PlayerRef>
) {
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

    const setCurrentTimeDebounced = useDebouncedCallback(setCurrentTime, 10, {
        maxWait: 100
    }).callback

    const onPlayerTimeChangeDebounced = useDebouncedCallback(
        props.onPlayerTimeChange || NOOP,
        300,
        { maxWait: 1000 }
    ).callback

    useEffect(() => {
        if (frame.current) {
            replayer.current = new Replayer(props.events, {
                root: frame.current,
                skipInactive: true,
                triggerFocus: false,
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
        setCurrentTimeDebounced(currentTime)
        onPlayerTimeChangeDebounced(currentTime)

        timer.current = requestAnimationFrame(updateTime)
    }

    const stopTimeLoop = () => {
        if (timer.current) {
            cancelAnimationFrame(timer.current)
        }
    }

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>
    ): void => {
        if (event.key === ' ') {
            togglePlayPause()
            event.preventDefault()
        } else if (event.key === 'ArrowLeft') {
            seek(currentTime - JUMP_TIME_MS)
        } else if (event.key === 'ArrowRight') {
            seek(currentTime + JUMP_TIME_MS)
        } else if (event.key === 'f') {
            toggleFullScreen()
        } else if (event.key === 'a') {
            props.onPrevious && props.onPrevious()
        } else if (event.key === 'd') {
            props.onNext && props.onNext()
        } else {
            // Playback speeds shortcuts
            for (let i = 0; i < PLAYBACK_SPEEDS.length; i++) {
                if (event.key === (i + 1).toString()) {
                    setSpeed(PLAYBACK_SPEEDS[i])
                }
            }
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

    const togglePlayPause = () => {
        if (!playing && currentTime >= meta.totalTime) {
            seek(0, { forcePlay: true })
        } else if (playing) {
            pause()
        } else {
            play()
        }
    }

    const seek = (
        time: number,
        { forcePlay }: { forcePlay?: boolean } = {}
    ) => {
        time = Math.max(Math.min(time, meta.totalTime), 0)
        replayer.current!.play(time)
        setCurrentTimeDebounced(time)
        onPlayerTimeChangeDebounced(time)
        setSkipping(false)
        if (!playing) {
            if (forcePlay) {
                setPlaying(true)
            } else {
                replayer.current!.pause()
            }
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

    useImperativeHandle(ref, () => ({ replayer, seek }))

    return (
        <div
            className='ph-rrweb-wrapper'
            ref={wrapper}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className='ph-rrweb-player' onClick={togglePlayPause}>
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
                    <div>
                        <Tooltip
                            placement='top'
                            overlayInnerStyle={{ minHeight: 'auto' }}
                            overlay='Play/pause (space)'
                        >
                            <span>
                                {playing ? (
                                    <IconPause
                                        onClick={togglePlayPause}
                                        className='ph-rrweb-controller-icon ph-rrweb-controller-icon-play-pause'
                                    />
                                ) : (
                                    <IconPlay
                                        onClick={togglePlayPause}
                                        className='ph-rrweb-controller-icon ph-rrweb-controller-icon-play-pause'
                                    />
                                )}
                            </span>
                        </Tooltip>
                        <Tooltip
                            placement='top'
                            overlayInnerStyle={{ minHeight: 'auto' }}
                            overlay={`Back ${
                                JUMP_TIME_MS / 1000
                            }s (← left arrow)`}
                        >
                            <span>
                                <IconSeekBack onClick={seekBack} />
                            </span>
                        </Tooltip>
                        <span className='ph-rrweb-timestamp'>
                            {formatTime(currentTime)} /{' '}
                            {formatTime(meta.totalTime)}
                        </span>
                    </div>
                    <div style={{ justifyContent: 'center' }}>
                        {props.onPrevious && (
                            <Tooltip
                                placement='top'
                                overlayInnerStyle={{ minHeight: 'auto' }}
                                overlay='Previous recording (a)'
                            >
                                <span>
                                    <IconStepBackward
                                        onClick={props.onPrevious}
                                    />
                                </span>
                            </Tooltip>
                        )}
                        {props.onNext && (
                            <Tooltip
                                placement='top'
                                overlayInnerStyle={{ minHeight: 'auto' }}
                                overlay='Next recording (d)'
                            >
                                <span>
                                    <IconStepForward onClick={props.onNext} />
                                </span>
                            </Tooltip>
                        )}
                    </div>
                    <div style={{ justifyContent: 'flex-end' }}>
                        {PLAYBACK_SPEEDS.map((speedToggle, index) => (
                            <React.Fragment key={speedToggle}>
                                <Tooltip
                                    placement='top'
                                    overlayInnerStyle={{ minHeight: 'auto' }}
                                    overlay={`${speedToggle}x speed (${
                                        index + 1
                                    })`}
                                >
                                    <span
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
                                </Tooltip>
                            </React.Fragment>
                        ))}
                        {screenfull.isEnabled && (
                            <Tooltip
                                placement='top'
                                overlayInnerStyle={{ minHeight: 'auto' }}
                                overlay='Full screen (f)'
                            >
                                <span>
                                    <IconFullscreen
                                        onClick={toggleFullScreen}
                                    />
                                </span>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
