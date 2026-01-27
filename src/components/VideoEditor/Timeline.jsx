import { useRef } from 'react';
import Track from './Track';
import './Timeline.css';

const PIXELS_PER_SECOND = 50;
const TRACK_HEIGHT = 40;

function getTickInterval(totalDuration) {
  if (totalDuration <= 10) return 1;
  if (totalDuration <= 60) return 5;
  return 10;
}

function formatRulerTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) return `${mins}:${String(secs).padStart(2, '0')}`;
  return `${secs}s`;
}

function Timeline({ currentTime, totalDuration, tracks, onSeek }) {
  const scrollRef = useRef(null);
  const pps = PIXELS_PER_SECOND;
  const timelineWidth = totalDuration * pps;
  const tickInterval = getTickInterval(totalDuration);

  const ticks = [];
  for (let t = 0; t <= totalDuration; t += tickInterval) {
    ticks.push(t);
  }

  const handleRulerClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(clickX / pps, totalDuration));
    onSeek(newTime);
  };

  const handleTrackClick = (e) => {
    // Only handle clicks on the track content area (not labels)
    const trackContent = e.target.closest('.ve-track-content');
    if (!trackContent) return;
    const rect = trackContent.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(clickX / pps, totalDuration));
    onSeek(newTime);
  };

  const trackConfig = [
    { type: 'voice', icon: '🎤', items: tracks.voice, showAddButton: true },
    { type: 'text', icon: 'Aa', items: tracks.text, showAddButton: false },
    { type: 'bgm', icon: '🎵', items: tracks.bgm ? [tracks.bgm] : [], showAddButton: true },
    { type: 'video', icon: '🎬', items: tracks.video, showAddButton: false },
  ];

  return (
    <div className="ve-timeline">
      <div className="ve-timeline-scroll" ref={scrollRef}>
        <div
          className="ve-timeline-inner"
          style={{ width: `${timelineWidth + 50}px` }}
        >
          {/* Ruler */}
          <div
            className="ve-timeline-ruler"
            style={{ width: `${timelineWidth}px` }}
            onClick={handleRulerClick}
          >
            {ticks.map((t) => (
              <div
                key={t}
                className="ve-timeline-ruler-mark"
                style={{ left: `${t * pps}px` }}
              >
                <div className="ve-timeline-ruler-line" />
                <span className="ve-timeline-ruler-label">
                  {formatRulerTime(t)}
                </span>
              </div>
            ))}
          </div>

          {/* Tracks */}
          <div className="ve-timeline-tracks" onClick={handleTrackClick}>
            {trackConfig.map(({ type, icon, items, showAddButton }) => (
              <Track
                key={type}
                type={type}
                icon={icon}
                items={items}
                totalDuration={totalDuration}
                pps={pps}
                showAddButton={showAddButton}
              />
            ))}
          </div>

          {/* Playhead */}
          <div
            className="ve-timeline-playhead"
            style={{
              left: `${currentTime * pps}px`,
              height: `${24 + trackConfig.length * TRACK_HEIGHT}px`,
            }}
          >
            <div className="ve-timeline-playhead-head" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timeline;
