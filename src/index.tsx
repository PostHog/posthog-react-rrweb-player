import React, { createRef, PureComponent, RefObject } from 'react'
import Slider from 'rc-slider/lib/Slider'
import { FaPlay } from 'react-icons/fa'
import { IconContext } from 'react-icons'
import { Replayer } from 'rrweb'
import events from './recording'

import './styles.css'
import 'rc-slider/assets/index.css'
import 'rrweb/dist/rrweb.min.css'

interface Props {}

export class Player extends PureComponent<Props> {
    frame: RefObject<HTMLDivElement> = createRef()
    replayer: Replayer

    componentDidMount() {
        if (this.frame.current) {
            this.replayer = new Replayer(events, {
                root: this.frame.current,
                speed: 4,
                skipInactive: true
            })

            this.replayer.play()

            this.replayer.on('resize', this.updatePlayerDimensions)

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

    updatePlayerDimensions = (replayDimensions: {
        width: number
        height: number
    }) => {
        const { width } = this.frame.current!.getBoundingClientRect()

        const scale = Math.min(width / replayDimensions.width, 1)
        this.replayer.wrapper.style.transform = `scale(${scale})`
    }

    render = () => (
        <div className='ph-rrweb-wrapper'>
            <div className='ph-rrweb-frame' ref={this.frame} />
            <div className='ph-rrweb-bottom'>
                <div className='ph-rrweb-progress'>
                    <Slider max={1800} value={20} min={0} step={0.01} />
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
