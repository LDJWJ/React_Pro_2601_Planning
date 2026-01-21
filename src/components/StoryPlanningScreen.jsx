import { useState, useEffect, useRef } from 'react';
import './StoryPlanningScreen.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 샘플 데이터
const defaultCuts = [
  { id: 1, title: "착석 후 첫 컷", description: "인물 + 커피 마시기 (상반신)", time: "2초", startTime: 0 },
  { id: 2, title: "테이블 무드", description: "소지품 + 커피 (줌 인)", time: "2초", startTime: 2 },
  { id: 3, title: "인물 리액션", description: "착석 리액션 컷 (상반신)", time: "1초", startTime: 4 },
  { id: 4, title: "인물 전신샷", description: "나 + 카페에 앉아서 커피 들어올리기", time: "2초", startTime: 5 },
  { id: 5, title: "테이블 무드", description: "소지품 + 커피 (줌 아웃)", time: "2초", startTime: 7 },
  { id: 6, title: "테이블 무드", description: "소지품 + 커피 (줌 인)", time: "1초", startTime: 9 },
];

function StoryPlanningScreen({ template, onBack, onSave }) {
  const [memos, setMemos] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const cuts = template?.cuts ?
    Array.from({ length: template.cuts }, (_, i) => defaultCuts[i] || {
      id: i + 1,
      title: `컷 ${i + 1}`,
      description: "설명",
      time: "2초",
      startTime: i * 2
    }) : defaultCuts;

  useEffect(() => {
    logScreenView('story_planning');
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

  const handleMemoChange = (cutId, value) => {
    setMemos(prev => ({ ...prev, [cutId]: value }));
  };

  const handleCancel = () => {
    logButtonClick('story_planning', 'cancel');
    onBack();
  };

  const handleSave = () => {
    logButtonClick('story_planning', 'save');
    if (onSave) {
      onSave(memos);
    }
    onBack();
  };

  const handleBack = () => {
    logButtonClick('story_planning', 'back');
    onBack();
  };

  return (
    <div className="story-planning-container">
      {/* 전체 스크롤 영역 */}
      <div className="story-scroll-content">
        {/* 상단 영역: 검정 배경 */}
        <div className="story-preview-section">
          <button className="story-back-button" onClick={handleBack}>
            ←
          </button>
          <div className="story-video-wrapper">
            <div className="story-video-container" onClick={handlePlayPause}>
              {template?.videoUrl ? (
                <video
                  ref={videoRef}
                  className="story-video-player"
                  src={template.videoUrl}
                  muted
                  loop
                  playsInline
                  poster={template.thumbnail}
                />
              ) : (
                <div className="story-video-placeholder">
                  {template?.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt="템플릿"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/400/700?random=' + (template?.id || 1);
                      }}
                    />
                  ) : (
                    <span>미리보기</span>
                  )}
                </div>
              )}
              {!isPlaying && (
                <div className="story-play-overlay">▶</div>
              )}
              <div className="story-video-info">
                <span className="info-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  00:10
                </span>
                <span className="info-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  </svg>
                  {cuts.length}컷
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 콘텐츠 영역: 흰색 배경 */}
        <div className="story-content-section">
          {/* 헤더 */}
          <div className="story-header">
            <h2 className="story-title">스토리 기획</h2>
            <p className="story-description">각 장에 맞을 장면을 미리 생각해보고 적어보세요.</p>
          </div>

          {/* 컷 리스트 */}
          <div className="cut-list-container">
            {cuts.map((cut, index) => (
              <div key={cut.id} className="cut-item">
                <div className="cut-number">{index + 1}</div>
                <div className="cut-content">
                  <div className="cut-header">
                    <span className="cut-title">{cut.title}</span>
                    <span className="cut-time">{cut.time}</span>
                  </div>
                  <p className="cut-description">{cut.description}</p>
                  {/* 첫 번째 씬에만 메모 입력 필드 표시 */}
                  {index === 0 && (
                    <input
                      type="text"
                      className="cut-memo-input"
                      placeholder="메모를 입력하세요"
                      value={memos[cut.id] || ''}
                      onChange={(e) => handleMemoChange(cut.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 하단 버튼 - 스크롤 내부에 포함 */}
          <div className="story-bottom-buttons">
            <button className="cancel-button" onClick={handleCancel}>
              취소
            </button>
            <button className="save-button" onClick={handleSave}>
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryPlanningScreen;
