import React, { useEffect, useState } from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'
import CSSTransition from 'react-transition-group/CSSTransition'

interface Props {
    playing: boolean
}

export function PlayPauseOverlay({ playing }: Props): JSX.Element | null {
    const [show, setShow] = useState(false)
    // const [key, setKey] = useState(0)

    console.log({ playing, show })

    useEffect(() => {
        // setKey(key + 1)
        setShow(true)
    }, [playing])

    return (
        <CSSTransition
            in={show}
            timeout={400}
            classNames='ph-rrweb-play-pause-overlay'
            onEntered={() => setShow(false)}
        >
            <div className='ph-rrweb-play-pause-overlay'>
                {playing ? <FaPlay className='ph-rrweb-large-icon' /> : <FaPause className='ph-rrweb-large-icon' />}
            </div>
        </CSSTransition>
    )
}
