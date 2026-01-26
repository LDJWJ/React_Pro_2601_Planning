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

function StoryPlanningScreen({ template, onBack, onSave, initialMemos }) {
  const [memos, setMemos] = useState(initialMemos || {});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeCutId, setActiveCutId] = useState(null);
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

  const handleCutSelect = (cut) => {
    setActiveCutId(cut.id);
    if (videoRef.current && template?.videoUrl) {
      videoRef.current.currentTime = cut.startTime;
      videoRef.current.pause();
      setIsPlaying(false);
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
    setShowModal(true);
  };

  const handleConfirmSave = () => {
    if (onSave) {
      onSave(memos);
    }
    setShowModal(false);
    onBack();
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 메모가 입력된 씬 개수 계산
  const scenes = cuts.map(cut => ({ ...cut, memo: memos[cut.id] || '' }));
  const activeCount = scenes.filter(s => s.memo.trim() !== '').length;

  // 프로그레스 바 구간 비율 (2:2:1:2:2:1 = 총 10)
  const progressWidths = [2, 2, 1, 2, 2, 1];

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
          <div className="story-header-bar">
            <button className="story-back-button" onClick={handleBack}>
              ‹
            </button>
            <span className="story-header-title">기획노트</span>
          </div>
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
            </div>
          </div>
          <div className="story-video-info-vertical">
            <span className="info-line">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              00:10
            </span>
            <span className="info-line">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
              {cuts.length}컷
            </span>
          </div>
        </div>

        {/* 콘텐츠 영역: 흰색 배경 */}
        <div className="story-content-section">
          {/* 프로그레스 바 */}
          <div className="story-progress-bar">
            {progressWidths.map((width, index) => (
              <div
                key={index}
                className={`sp-progress-segment ${index < activeCount ? 'active' : ''}`}
                style={{ flex: width }}
              />
            ))}
          </div>

          {/* 헤더 */}
          <div className="story-header">
            <h2 className="story-title">스토리 기획</h2>
            <p className="story-description">각 컷에 넣을 장면을 미리 생각해보고 적어보세요.</p>
          </div>

          {/* 컷 리스트 */}
          <div className="sp-cut-list-container">
            {cuts.map((cut, index) => (
              <div
                key={cut.id}
                className={`sp-cut-item ${activeCutId === cut.id ? 'sp-cut-item-active' : ''}`}
                onClick={() => handleCutSelect(cut)}
              >
                <div className="sp-cut-number">{index + 1}</div>
                <div className="sp-cut-content">
                  <div className="sp-cut-header">
                    <span className="sp-cut-title">{cut.title}</span>
                    <span className="sp-cut-time-badge">{cut.time}</span>
                  </div>
                  <p className="sp-cut-description">{cut.description}</p>
                  <input
                    type="text"
                    className="sp-cut-memo-input"
                    placeholder="메모를 입력하세요"
                    value={memos[cut.id] || ''}
                    onChange={(e) => handleMemoChange(cut.id, e.target.value)}
                    onFocus={() => handleCutSelect(cut)}
                  />
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

      {/* 저장 확인 모달 */}
      {showModal && (
        <div className="story-modal-overlay" onClick={handleCloseModal}>
          <div className="story-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="story-modal-title">스토리 기획을 저장할까요?</h3>
            <p className="story-modal-description">입력한 메모가 저장돼요.</p>
            <div className="story-modal-buttons">
              <button className="modal-cancel-button" onClick={handleCloseModal}>
                아니요
              </button>
              <button className="modal-confirm-button" onClick={handleConfirmSave}>
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoryPlanningScreen;
