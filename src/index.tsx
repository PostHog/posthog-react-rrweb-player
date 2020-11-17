import React, { createRef, PureComponent, RefObject } from 'react'
import Slider from 'rc-slider/lib/Slider'
import { FaPlay } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import { Replayer } from 'rrweb'
import events from './recording'

import './styles.css'
import 'rc-slider/assets/index.css'
import 'rrweb/dist/rrweb.min.css'
import { playerMetaData, viewportResizeDimention } from 'rrweb/typings/types'

interface Props {}

interface State {
    playing: boolean
    currentTime: number
    meta: playerMetaData
}

export class Player extends PureComponent<Props, State> {
    state: State = {
        playing: false,
        currentTime: 0,
        meta: {
            startTime: 0,
            endTime: 0,
            totalTime: 0
        }
    }

    frame: RefObject<HTMLDivElement> = createRef()
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

            this.replayer.play()

            window.addEventListener('resize', () =>
                this.updatePlayerDimensions(this.replayDimensions)
            )
            this.replayer.on('resize', this.updatePlayerDimensions)
            this.replayer.on('start', this.startTimeLoop)
            this.replayer.on('resume', this.startTimeLoop)
            this.replayer.on('pause', this.stopTimeLoop)
            this.replayer.on('finish', this.stopTimeLoop)

            const meta = this.replayer.getMetaData()
            this.setState({ meta })
            this.updateTime()

            // @ts-ignore
            window.replayer = this.replayer

            const addHandler = (event: string) => {
                this.replayer.on(event, (...args: any[]) =>
                    console.log('replayer event:', event, args)
                )
            }

            addHandler('start')
            addHandler('pause')
            addHandler('resume')
            addHandler('resize')
            addHandler('finish')
            addHandler('fullsnapshot-rebuilded')
            addHandler('load-stylesheet-start')
            addHandler('load-stylesheet-end')
            addHandler('skip-start')
            addHandler('skip-end')
            addHandler('mouse-interaction')
            addHandler('event-cast')
            addHandler('custom-event')
            addHandler('flush')
            addHandler('state-change')
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

    updateTime = () => {
        const currentTime = this.replayer.getCurrentTime()
        this.setState({ currentTime })

        this.timer = requestAnimationFrame(this.updateTime)
    }

    render = () => (
        <div className='ph-rrweb-wrapper'>
            <div className='ph-rrweb-frame' ref={this.frame} />
            <div className='ph-rrweb-bottom'>
                <div className='ph-rrweb-progress'>
                    <Slider
                        value={this.state.currentTime}
                        min={0}
                        max={this.state.meta.totalTime}
                        step={0.01}
                    />
                </div>
                <div className='ph-rrweb-controller'>
                    <IconContext.Provider
                        value={{
                            className: 'ph-rrweb-controller-icon'
                        }}
                    >
                        <FaPlay />
                        00:00 / 01:56
                        <div />
                    </IconContext.Provider>
                </div>
            </div>
        </div>
    )
}
