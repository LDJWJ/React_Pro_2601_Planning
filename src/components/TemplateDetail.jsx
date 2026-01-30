import { useState, useEffect, useRef } from 'react';
import './TemplateDetail.css';
import { Button } from './common';
import { logScreenView, logButtonClick } from '../utils/logger';

function TemplateDetail({ template, onBack, onTabChange, onStoryPlanning, onStoryEdit, onContentUpload }) {
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
    if (onStoryEdit) {
      onStoryEdit(template);
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

          {/* 하단 오버레이 - 우측 아이콘 + 해시태그 + 버튼 */}
          <div className="template-bottom-overlay">
            {/* 우측 아이콘 4개 */}
            <div className="info-items-column">
              <button className={`info-item info-icon-btn${activeIcon === 'duration' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('duration'); }}>
                <span className="info-icon-mask" style={{ maskImage: 'url(/images/template-selected/vedio-time.svg)', WebkitMaskImage: 'url(/images/template-selected/vedio-time.svg)' }} aria-label="시간" />
                <span>{formatDuration(template.duration)}</span>
              </button>
              <button className={`info-item info-icon-btn${activeIcon === 'cuts' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('cuts'); }}>
                <span className="info-icon-mask" style={{ maskImage: 'url(/images/template-selected/media.svg)', WebkitMaskImage: 'url(/images/template-selected/media.svg)' }} aria-label="컷" />
                <span>{template.cuts}컷</span>
              </button>
              <button className={`info-item info-icon-btn${activeIcon === 'users' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('users'); }}>
                <span className="info-icon-mask" style={{ maskImage: 'url(/images/template-selected/used-count.svg)', WebkitMaskImage: 'url(/images/template-selected/used-count.svg)' }} aria-label="사용자" />
                <span>200명</span>
              </button>
              <button className={`info-item info-icon-btn${activeIcon === 'bookmark' ? ' info-item-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleIconSelect('bookmark'); handleSaveToggle(); }}>
                <span className="info-icon-mask" style={{ maskImage: `url(${isSaved ? '/images/template-selected/bookmark_filled.svg' : '/images/template-selected/bookmark_lined.svg'})`, WebkitMaskImage: `url(${isSaved ? '/images/template-selected/bookmark_filled.svg' : '/images/template-selected/bookmark_lined.svg'})` }} aria-label="북마크" />
              </button>
            </div>

            {/* 해시태그 */}
            <div className="template-hashtags-overlay">
              <span className="hashtag">#맛집</span>
              <span className="hashtag">#브이로그</span>
            </div>

            {/* 하단 버튼 2개 - 전체 너비 */}
            <div className="template-bottom-buttons">
              <Button variant="secondary" onClick={handleStoryPlanningClick}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="8" y1="8" x2="16" y2="8" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="16" x2="12" y2="16" />
                </svg>
                영상 가이드
              </Button>
              <Button variant="primary" onClick={handleStartEdit}>
                템플릿 사용하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateDetail;
