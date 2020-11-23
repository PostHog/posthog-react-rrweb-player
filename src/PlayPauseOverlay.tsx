import React, { useEffect, useState } from 'react'
import { IconPlay, IconPause } from './icons'
import CSSTransition from 'react-transition-group/CSSTransition'

interface Props {
    playing: boolean
}

export function PlayPauseOverlay({ playing }: Props): JSX.Element | null {
    const [show, setShow] = useState(false)
    const [changeCount, setChangeCount] = useState(0)

    useEffect(() => {
        setShow(true)
        setChangeCount(changeCount + 1)
    }, [playing])

    return (
        <CSSTransition
            in={changeCount > 1 && show}
            timeout={400}
            classNames='ph-rrweb-play-pause-overlay'
            onEntered={() => setShow(false)}
        >
            <div className='ph-rrweb-play-pause-overlay'>
                {playing ? (
                    <IconPlay className='ph-rrweb-play-pause-overlay-icon' />
                ) : (
                    <IconPause className='ph-rrweb-play-pause-overlay-icon' />
                )}
            </div>
        </CSSTransition>
    )
}
