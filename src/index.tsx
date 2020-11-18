import React, { createRef, PureComponent, RefObject } from 'react'
import Slider from 'rc-slider/lib/Slider'
import { FaBackward, FaPause, FaPlay } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import { Replayer } from 'rrweb'
import { playerMetaData, viewportResizeDimention } from 'rrweb/typings/types'

import { formatTime } from './time'
import { PlayPauseOverlay } from './PlayPauseOverlay'

import './styles.css'
import 'rc-slider/assets/index.css'
import 'rrweb/dist/rrweb.min.css'

const JUMP_TIME_MS = 8_000
const events: any = JSON.parse(localStorage.getItem('session')!).result

interface Props {}

interface State {
    playing: boolean
    currentTime: number
    meta: playerMetaData
}

export class Player extends PureComponent<Props, State> {
    state: State = {
        playing: true,
        currentTime: 0,
        meta: {
            startTime: 0,
            endTime: 0,
            totalTime: 0
        }
    }

    frame: RefObject<HTMLDivElement> = createRef()
    wrapper: RefObject<HTMLDivElement> = createRef()
    replayer: Replayer
    replayDimensions: viewportResizeDimention
    timer: number

    componentDidMount() {
        if (this.frame.current) {
            this.replayer = new Replayer(events, {
                root: this.frame.current,
                speed: 4,
                skipInactive: true
            })

            window.addEventListener('resize', () =>
                this.updatePlayerDimensions(this.replayDimensions)
            )
            this.replayer.on('resize', this.updatePlayerDimensions)
            this.replayer.on('start', this.startTimeLoop)
            this.replayer.on('resume', this.startTimeLoop)
            this.replayer.on('pause', this.stopTimeLoop)
            this.replayer.on('finish', this.stopTimeLoop)
            this.replayer.on('finish', this.pause)

            this.replayer.play()

            const meta = this.replayer.getMetaData()
            this.setState({ playing: true, meta })
            this.updateTime()

            this.wrapper.current!.focus()

            // @ts-ignore
            window.replayer = this.replayer

            // const addHandler = (event: string) => {
            //     this.replayer.on(event, (...args: any[]) =>
            //         console.log('replayer event:', event, args)
            //     )
            // }

            // addHandler('start')
            // addHandler('pause')
            // addHandler('resume')
            // addHandler('resize')
            // addHandler('finish')
            // addHandler('fullsnapshot-rebuilded')
            // addHandler('load-stylesheet-start')
            // addHandler('load-stylesheet-end')
            // addHandler('skip-start')
            // addHandler('skip-end')
            // addHandler('mouse-interaction')
            // addHandler('event-cast')
            // addHandler('custom-event')
            // addHandler('flush')
            // addHandler('state-change')
        }
    }

    updatePlayerDimensions = (replayDimensions: viewportResizeDimention) => {
        this.replayDimensions = replayDimensions
        const { width } = this.frame.current!.getBoundingClientRect()

        const scale = Math.min(width / replayDimensions.width, 1)
        this.replayer.wrapper.style.transform = `scale(${scale})`
    }

    startTimeLoop = () => {
        this.stopTimeLoop()
        this.updateTime()
    }

    stopTimeLoop = () => {
        cancelAnimationFrame(this.timer)
    }

    handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === ' ') {
            if (this.state.playing) {
                this.pause()
            } else {
                this.play()
            }
        } else if (event.key === 'ArrowLeft') {
            this.seek(this.state.currentTime - JUMP_TIME_MS / 2)
        } else if (event.key === 'ArrowRight') {
            this.seek(this.state.currentTime + JUMP_TIME_MS / 2)
        }
    }

    updateTime = () => {
        const currentTime = Math.min(this.replayer.getCurrentTime(), this.state.meta.totalTime)
        this.setState({ currentTime })

        this.timer = requestAnimationFrame(this.updateTime)
    }

    play = () => {
        this.setState({ playing: true })
        this.replayer.play(this.state.currentTime)
    }

    pause = () => {
        this.setState({ playing: false })
        this.replayer.pause()
    }

    seek = (time: number) => {
        this.replayer.play(time)
        this.setState({ currentTime: time })
        if (!this.state.playing) {
            this.replayer.pause()
        }
    }

    seekBack = () => {
        this.seek(this.state.currentTime - JUMP_TIME_MS)
    }

    render = () => (
        <div
            className='ph-rrweb-wrapper'
            ref={this.wrapper}
            onKeyDown={this.handleKeyDown}
            tabIndex={0}
        >
            <div
                className='ph-rrweb-frame'
                ref={this.frame}
                onClick={this.state.playing ? this.pause : this.play}
            >
                <div className='ph-rrweb-overlay'>
                    <PlayPauseOverlay playing={this.state.playing} />
                </div>
            </div>
            <div className='ph-rrweb-bottom'>
                <div className='ph-rrweb-progress'>
                    <Slider
                        value={this.state.currentTime}
                        min={0}
                        max={this.state.meta.totalTime}
                        step={0.01}
                        onChange={this.seek}
                    />
                </div>
                <div className='ph-rrweb-controller'>
                    <IconContext.Provider
                        value={{
                            className: 'ph-rrweb-controller-icon'
                        }}
                    >
                        {this.state.playing ? (
                            <FaPause onClick={this.play} />
                        ) : (
                            <FaPlay onClick={this.pause} />
                        )}
                        <FaBackward onClick={this.seekBack} />
                        {formatTime(this.state.currentTime)} /{' '}
                        {formatTime(this.state.meta.totalTime)}
                        <div />
                    </IconContext.Provider>
                </div>
            </div>
        </div>
    )
}
