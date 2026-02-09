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
}) {
  return (
    <div className="ve-preview">
      {/* 왼쪽 재생 버튼 */}
      <button className="ve-preview-play-btn" onClick={onPlayPause}>
        <img
          src={isPlaying ? '/images/editor/video-stop.png' : '/images/editor/video-play.png'}
          alt={isPlaying ? '일시정지' : '재생'}
          className="ve-preview-play-icon"
        />
      </button>

      {/* 중앙 비디오 프레임 */}
      <div className="ve-preview-frame">
        {currentClip?.videoUrl ? (
          <video
            ref={videoRef}
            className="ve-preview-video"
            src={currentClip.videoUrl}
            muted
            playsInline
          />
        ) : currentClip?.thumbnail ? (
          <img
            src={currentClip.thumbnail}
            alt="썸네일"
            className="ve-preview-thumbnail"
          />
        ) : (
          <div className="ve-preview-placeholder">영상을 선택하세요</div>
        )}

        {currentSubtitle && (
          <div className="ve-preview-subtitle-overlay">
            <span className="ve-preview-subtitle-text">{currentSubtitle}</span>
          </div>
        )}

        {/* 하단 체크 버튼 */}
        <button className="ve-preview-check-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>

      {/* 오른쪽 시간 표시 */}
      <span className="ve-preview-time">
        {formatTime(totalDuration)}
      </span>
    </div>
  );
}

export default VideoPreview;
