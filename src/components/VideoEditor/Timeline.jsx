import { useRef, useCallback } from 'react';
import Track from './Track';
import './Timeline.css';

const PIXELS_PER_SECOND = 80;  // 50 → 80 (간격 넓힘)
const TRACK_HEIGHT = 40;
const TRACK_LABEL_WIDTH = 40;

function getTickInterval(totalDuration) {
  if (totalDuration <= 30) return 1;   // 30초 이하면 1초 간격
  if (totalDuration <= 60) return 2;   // 1분 이하면 2초 간격
  return 5;                             // 그 이상이면 5초 간격
}

function formatRulerTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function Timeline({ currentTime, totalDuration, tracks, onSeek, onScroll }) {
  const scrollRef = useRef(null);

  const pps = PIXELS_PER_SECOND;
  const timelineWidth = totalDuration * pps;
  const tickInterval = getTickInterval(totalDuration);

  const ticks = [];
  for (let t = 0; t <= totalDuration; t += tickInterval) {
    ticks.push(t);
  }

  const handleScroll = useCallback((e) => {
    onScroll?.(e);
  }, [onScroll]);

  const handleTimeBarClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(clickX / pps, totalDuration));
    onSeek(newTime);
  };

  const handleTrackClick = (e) => {
    const trackContent = e.target.closest('.ve-track-content');
    if (!trackContent) return;
    const rect = trackContent.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(clickX / pps, totalDuration));
    onSeek(newTime);
  };

  // 트랙 순서: 마이크, Text, 음악, 필름
  const trackConfig = [
    { type: 'voice', icon: '/images/editor/mic.png', items: tracks.voice, showAddButton: true },
    { type: 'text', icon: '/images/editor/text.png', items: tracks.text, showAddButton: false },
    { type: 'bgm', icon: '/images/editor/music.png', items: tracks.bgm ? [tracks.bgm] : [], showAddButton: true },
    { type: 'video', icon: '/images/editor/film.png', items: tracks.video, showAddButton: false },
  ];

  return (
    <div className="ve-timeline">
      {/* 시간 표시 바 */}
      <div className="ve-timeline-time-bar-row">
        <div className="ve-timeline-time-bar-label" />
        <div
          className="ve-timeline-time-bar"
          style={{ width: `${timelineWidth}px` }}
          onClick={handleTimeBarClick}
        >
          {ticks.map((t) => (
            <span
              key={t}
              className={`ve-timeline-time-mark ${Math.abs(currentTime - t) < tickInterval / 2 ? 'active' : ''}`}
              style={{ left: `${t * pps}px` }}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(t);
              }}
            >
              {formatRulerTime(t)}
            </span>
          ))}
        </div>
      </div>

      {/* 트랙 영역 */}
      <div
        className="ve-timeline-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div
          className="ve-timeline-inner"
          style={{ width: `${timelineWidth + TRACK_LABEL_WIDTH}px` }}
        >
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
              left: `${TRACK_LABEL_WIDTH + currentTime * pps}px`,
              height: `${trackConfig.length * TRACK_HEIGHT}px`,
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
