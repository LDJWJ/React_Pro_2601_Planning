import { useState, useEffect, useRef } from 'react';
import './TemplateDetail.css';
import { logScreenView, logButtonClick } from '../utils/logger';

function TemplateDetail({ template, onBack, onEditStart, onTabChange, onStoryPlanning, onContentUpload }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);
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
    if (onContentUpload) {
      onContentUpload(template);
    } else if (template?.videoUrl && onTabChange) {
      onTabChange('editor', { videoUrl: template.videoUrl });
    }
  };

  const handleIconSelect = (iconName) => {
    setActiveIcon(prev => prev === iconName ? null : iconName);
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

  const formatDuration = (duration) => {
    let seconds = 0;
    if (typeof duration === 'number') {
      seconds = duration;
    } else if (typeof duration === 'string') {
      seconds = parseInt(duration.replace(/[^0-9]/g, ''), 10) || 0;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
      {/* 상단 헤더 - 오버레이 */}
      <div className="template-detail-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
      </div>

      {/* 전체 화면 비디오 영역 */}
      <div className="template-main-content">
        <div className="template-preview-section">
          <div className="video-player-container" onClick={handlePlayPause}>
            {template.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  className="video-player"
                  src={template.videoUrl}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                  muted
                  poster={template.thumbnail}
                />
                {!isPlaying && (
                  <button className="play-button-overlay">
                    ▶
                  </button>
                )}
              </>
            ) : (
              <div className="no-video-placeholder">
                <img
                  src={template.thumbnail}
                  alt="템플릿"
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/400/700?random=' + template.id;
                  }}
                />
                <button className="play-button-overlay">
                  ▶
                </button>
              </div>
            )}
          </div>

          {/* 하단 오버레이 - 해시태그 + 버튼 + 우측 아이콘 */}
          <div className="template-bottom-overlay">
            <div className="template-bottom-row">
              <div className="template-left-column">
                <div className="template-hashtags-overlay">
                  <span className="hashtag">#맛집</span>
                  <span className="hashtag">#브이로그</span>
                  <span className="hashtag">#감성</span>
                </div>
                <button className="start-edit-button" onClick={handleStartEdit}>
                  편집 시작하기
                </button>
              </div>
              <div className="info-items-column">
                <button className={`info-item info-icon-btn${activeIcon === 'duration' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('duration'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span>{formatDuration(template.duration)}</span>
                </button>
                <button className={`info-item info-icon-btn${activeIcon === 'cuts' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('cuts'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h16v16H4V4zm2 2v2h2V6H6zm10 0v2h2V6h-2zM6 10v2h2v-2H6zm10 0v2h2v-2h-2zM6 14v2h2v-2H6zm10 0v2h2v-2h-2zM9 7v10h6V7H9z" />
                  </svg>
                  <span>{template.cuts}컷</span>
                </button>
                <button className={`info-item info-icon-btn${activeIcon === 'users' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('users'); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  <span>1.2k</span>
                </button>
                <button className={`info-item info-icon-btn${activeIcon === 'bookmark' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('bookmark'); handleSaveToggle(); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>1.2k</span>
                </button>
                <button className={`info-item info-icon-btn${activeIcon === 'menu' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('menu'); handleStoryPlanningClick(); }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetail;
