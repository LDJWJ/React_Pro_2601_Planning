import { useState, useEffect, useRef } from 'react';
import './TemplateDetail.css';
import { logScreenView, logButtonClick } from '../utils/logger';

function TemplateDetail({ template, onBack, onEditStart, onTabChange, onStoryPlanning }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    logScreenView('template_detail');
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStartEdit = () => {
    logButtonClick('template_detail', 'start_edit_button');
    if (template?.videoUrl && onTabChange) {
      onTabChange('edit', { videoUrl: template.videoUrl });
    }
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    logButtonClick('template_detail', 'like_toggle');
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    logButtonClick('template_detail', 'save_toggle');
  };

  const handleStoryPlanningClick = () => {
    logButtonClick('template_detail', 'story_planning');
    if (onStoryPlanning) {
      onStoryPlanning(template);
    }
  };

  if (!template) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        템플릿 정보를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="template-detail-container">
      {/* 상단 헤더 */}
      <div className="template-detail-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <span className="header-title">템플릿 상세</span>
        <div style={{ width: '24px' }} />
      </div>

      {/* 비디오 프리뷰 */}
      <div className="template-preview-section">
        <div className="video-player-container">
          {template.videoUrl ? (
            <>
              <video
                ref={videoRef}
                className="video-player"
                src={template.videoUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                className="play-button-overlay"
                onClick={handlePlayPause}
                style={{ display: isPlaying ? 'none' : 'flex' }}
              >
                ▶
              </button>
            </>
          ) : (
            <div className="no-video-placeholder">
              <img src={template.thumbnail} alt="템플릿" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* 시간 표시 */}
          <div className="time-display">
            00:10
          </div>

          {/* 템플릿 정보 - 오른쪽 오버레이 */}
          <div className="template-info-overlay">
            <div className="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>{template.duration}</span>
            </div>
            <div className="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              </svg>
              <span>{template.cuts}컷</span>
            </div>
            <div className="info-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span>{template.users}명</span>
            </div>
            <button className="info-item info-button" onClick={handleLikeToggle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "#ff4444" : "none"} stroke={isLiked ? "#ff4444" : "currentColor"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>1.2k</span>
            </button>
            <button className="info-item info-button" onClick={handleStoryPlanningClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              <span>기획</span>
            </button>
          </div>
        </div>
      </div>



      {/* 하단 설명 */}
      <div className="template-description">
        <p className="template-title">#맛집  #브이로그</p>

        {/* 편집 시작 버튼 영역 */}
        <div className="cta-button-area">
          <button className="start-edit-button" onClick={handleStartEdit}>
            편집 시작하기
          </button>
          <button className={`save-button ${isSaved ? 'saved' : ''}`} onClick={handleSaveToggle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* 하단 여백 */}
      <div style={{ height: '20px' }} />
    </div>
  );
}

export default TemplateDetail;
