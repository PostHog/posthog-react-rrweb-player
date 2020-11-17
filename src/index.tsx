import React, { createRef, PureComponent, RefObject } from 'react'
import Slider from 'rc-slider/lib/Slider'
import { FaPlay } from 'react-icons/fa'
import { IconContext } from 'react-icons'

import './styles.css'
import 'rc-slider/assets/index.css'

interface Props {}

export class Player extends PureComponent<Props> {
    frame: RefObject<HTMLDivElement> = createRef()

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
