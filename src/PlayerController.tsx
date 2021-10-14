import React, { useContext } from 'react'
import { PlayerContext } from './PlayerContext'
import Tooltip from 'rc-tooltip'
import { IconFullscreen, IconPause, IconPlay, IconSeekBack } from './icons'
import { formatTime } from './time'
import Slider from 'rc-slider/lib/Slider'
import screenfull from 'screenfull'

const JUMP_TIME_MS = 8_000
const PLAYBACK_SPEEDS = [0.5, 1, 2, 4, 8, 16]

export function PlayerController(): JSX.Element | null {
    const context = useContext(PlayerContext)
    if (!context) {
        // PlayerController must be wrapped by a Provider
        return null
    }

    const {
        speed,
        meta,
        setSpeed,
        playing,
        togglePlayPause,
        seek,
        seekBack,
        currentTime,
        isBuffering,
        toggleFullScreen
    } = context

    return (
        <div className='ph-rrweb-bottom'>
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
                        overlay={`Back ${JUMP_TIME_MS / 1000}s (← left arrow)`}
                    >
                        <span>
                            <IconSeekBack onClick={seekBack} />
                        </span>
                    </Tooltip>
                    <span className='ph-rrweb-timestamp'>
                        {formatTime(currentTime)} /{' '}
                        {isBuffering ? '--:--:--' : formatTime(meta.totalTime)}
                    </span>
                </div>
                <div className='ph-rrweb-progress'>
                    <Slider
                        value={currentTime}
                        min={0}
                        max={meta.totalTime}
                        step={0.01}
                        onChange={seek}
                    />
                </div>
                <div style={{ justifyContent: 'flex-end' }}>
                    {PLAYBACK_SPEEDS.map((speedToggle, index) => (
                        <React.Fragment key={speedToggle}>
                            <Tooltip
                                placement='top'
                                overlayInnerStyle={{ minHeight: 'auto' }}
                                overlay={`${speedToggle}x speed (${index + 1})`}
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
                                <IconFullscreen onClick={toggleFullScreen} />
                            </span>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    )
}
