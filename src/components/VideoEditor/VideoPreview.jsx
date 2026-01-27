import './VideoPreview.css';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function VideoPreview({
  videoRef,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  currentClip,
  currentSubtitle,
  cutCount,
}) {
  return (
    <div className="ve-preview">
      <div className="ve-preview-frame">
        {currentClip?.videoUrl ? (
          <video
            ref={videoRef}
            className="ve-preview-video"
            src={currentClip.videoUrl}
            muted
            playsInline
          />
        ) : (
          <div className="ve-preview-placeholder">영상을 선택하세요</div>
        )}

        {currentSubtitle && (
          <div className="ve-preview-subtitle-overlay">
            <span className="ve-preview-subtitle-text">{currentSubtitle}</span>
          </div>
        )}

        <div className="ve-preview-controls">
          <button className="ve-preview-play-btn" onClick={onPlayPause}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <span className="ve-preview-time">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
          <span className="ve-preview-cut-count">
            {cutCount}컷
          </span>
        </div>
      </div>
    </div>
  );
}

export default VideoPreview;
