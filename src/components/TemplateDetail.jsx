import { useState, useEffect, useRef } from 'react';
import './TemplateDetail.css';
import { Button } from './common';
import { logScreenView, logButtonClick } from '../utils/logger';

function TemplateDetail({ template, onBack, onTabChange, onStoryPlanning, onStoryEdit, onContentUpload, hasIdeaNote }) {
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (onStoryEdit) {
      onStoryEdit(template);
    } else if (template?.videoUrl && onTabChange) {
      onTabChange('editor', { videoUrl: template.videoUrl });
    }
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
        <div className="header-info">
          <span className="header-title">{template.title || '템플릿 미리보기'}</span>
          <span className="header-users">
            <img src="/images/meta-icons/03_pick.png" alt="users" width="14" height="14" />
            {template.users || template.usedCount || 200}명이 사용했어요!
          </span>
        </div>
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
                  poster={template.thumbnail || template.image}
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
                  src={template.image || template.thumbnail}
                  alt="템플릿"
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/400/700?random=' + template.id;
                  }}
                />
              </div>
            )}
            {template.overlayText && (
              <div className="video-overlay-text">
                {template.overlayText.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            )}
          </div>

          {/* 하단 오버레이 - 해시태그 + 버튼 */}
          <div className="template-bottom-overlay">
            {/* 하단 왼쪽 - 컷수, 시간 (가로 배치) */}
            <div className="info-items-row">
              <div className="info-item">
                <img src="/images/meta-icons/02_media.png" alt="컷" className="info-icon-img" />
                <span className="info-label">{template.cuts || 6}컷</span>
              </div>
              <div className="info-item">
                <img src="/images/meta-icons/01_time.png" alt="시간" className="info-icon-img" />
                <span className="info-label">{formatDuration(template.duration || 18)}</span>
              </div>
            </div>

            {/* 해시태그 + 북마크 */}
            <div className="template-hashtags-overlay">
              <div className="hashtag-list">
                {(template.tags || ['맛집', '브이로그']).map((tag, idx) => (
                  <span className="hashtag-chip" key={idx}>#{tag}</span>
                ))}
              </div>
              <button className={`bookmark-btn${isSaved ? ' bookmark-active' : ''}`} onClick={(e) => { e.stopPropagation(); handleSaveToggle(); }}>
                <img
                  src={isSaved ? '/images/bookmark/bookmark_filled.png' : '/images/bookmark/bookmark_lined.png'}
                  alt="bookmark"
                  width="24"
                  height="24"
                />
              </button>
            </div>

            {/* 하단 버튼 2개 - 전체 너비 */}
            <div className="template-bottom-buttons">
              <button
                className={`idea-note-btn ${hasIdeaNote ? 'completed' : ''}`}
                onClick={handleStoryPlanningClick}
              >
                <img
                  src="/images/meta-icons/2_2_idea_icon.png"
                  alt="idea"
                  width="24"
                  height="24"
                  style={{ marginRight: '6px' }}
                />
                아이디어 노트
              </button>
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
