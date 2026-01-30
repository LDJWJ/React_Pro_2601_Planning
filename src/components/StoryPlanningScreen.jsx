import { useState, useEffect, useRef, useCallback } from 'react';
import './StoryPlanningScreen.css';
import { Button, Chip } from './common';
import { logScreenView, logButtonClick, logScroll } from '../utils/logger';

// 샘플 데이터
const defaultCuts = [
  { id: 1, title: "착석 후 첫 컷", description: "인물 + 커피 마시기 (상반신)", time: "2초", startTime: 0 },
  { id: 2, title: "테이블 무드", description: "소지품 + 커피 (줌 인)", time: "2초", startTime: 2 },
  { id: 3, title: "인물 리액션", description: "착석 리액션 컷 (상반신)", time: "1초", startTime: 4 },
  { id: 4, title: "인물 전신샷", description: "나 + 카페에 앉아서 커피 들어올리기", time: "2초", startTime: 5 },
  { id: 5, title: "테이블 무드", description: "소지품 + 커피 (줌 아웃)", time: "2초", startTime: 7 },
  { id: 6, title: "테이블 무드", description: "소지품 + 커피 (줌 인)", time: "1초", startTime: 9 },
];

// AI 추천 실패 시 카테고리별 fallback 컷
const FALLBACK_CUTS_MAP = {
  '브이로그': [
    { title: "오프닝", time: "2초" },
    { title: "장소 소개", time: "2초" },
    { title: "활동 장면", time: "1초" },
    { title: "디테일 컷", time: "2초" },
    { title: "리액션", time: "2초" },
    { title: "엔딩 인사", time: "1초" },
  ],
  '먹방': [
    { title: "음식 전체샷", time: "2초" },
    { title: "첫 입 리액션", time: "2초" },
    { title: "클로즈업", time: "1초" },
    { title: "먹는 장면", time: "2초" },
    { title: "사이드 메뉴", time: "2초" },
    { title: "마무리 한마디", time: "1초" },
  ],
  '가게/브랜드 소개': [
    { title: "외관 소개", time: "2초" },
    { title: "내부 분위기", time: "2초" },
    { title: "대표 메뉴", time: "1초" },
    { title: "디테일 샷", time: "2초" },
    { title: "고객 반응", time: "2초" },
    { title: "마무리 멘트", time: "1초" },
  ],
  '제품/메뉴 홍보': [
    { title: "제품 등장", time: "2초" },
    { title: "디테일 클로즈업", time: "2초" },
    { title: "사용 장면", time: "1초" },
    { title: "효과 강조", time: "2초" },
    { title: "비교 컷", time: "2초" },
    { title: "구매 유도", time: "1초" },
  ],
  '일상/경험 공유': [
    { title: "일상 시작", time: "2초" },
    { title: "준비 과정", time: "2초" },
    { title: "하이라이트", time: "1초" },
    { title: "감성 컷", time: "2초" },
    { title: "마무리 장면", time: "2초" },
    { title: "엔딩 한마디", time: "1초" },
  ],
  default: [
    { title: "인트로", time: "2초" },
    { title: "메인 장면 1", time: "2초" },
    { title: "전환 컷", time: "1초" },
    { title: "메인 장면 2", time: "2초" },
    { title: "하이라이트", time: "2초" },
    { title: "아웃트로", time: "1초" },
  ],
};

function getFallbackCuts(purpose, topics) {
  // 목적 매칭 우선
  if (purpose && FALLBACK_CUTS_MAP[purpose]) return FALLBACK_CUTS_MAP[purpose];
  // 주제 매칭
  if (topics && topics.length > 0) {
    for (const topic of topics) {
      if (FALLBACK_CUTS_MAP[topic]) return FALLBACK_CUTS_MAP[topic];
    }
  }
  return FALLBACK_CUTS_MAP.default;
}

function StoryPlanningScreen({ template, onBack, onSave, initialMemos, selections }) {
  const [memos, setMemos] = useState(initialMemos || {});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeCutId, setActiveCutId] = useState(null);
  const [aiCuts, setAiCuts] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const videoRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTimerRef = useRef(null);

  const baseCuts = aiCuts || (template?.cuts ?
    Array.from({ length: template.cuts }, (_, i) => defaultCuts[i] || {
      id: i + 1,
      title: `컷 ${i + 1}`,
      description: "설명",
      time: "2초",
      startTime: i * 2
    }) : defaultCuts);
  const cuts = baseCuts;

  const handleAiRecommend = async () => {
    setAiLoading(true);
    logButtonClick('story_planning', 'ai_recommend');
    try {
      const res = await fetch('/.netlify/functions/generate-cuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: selections?.purpose,
          topics: selections?.topics,
        }),
      });
      const data = await res.json();
      if (data.cuts && Array.isArray(data.cuts)) {
        let startTime = 0;
        const newCuts = data.cuts.map((cut, i) => {
          const seconds = parseInt(cut.time) || 2;
          const result = {
            id: i + 1,
            title: cut.title,
            description: cut.description || '',
            time: cut.time,
            startTime,
          };
          startTime += seconds;
          return result;
        });
        setAiCuts(newCuts);
        setMemos({});
        setActiveCutId(null);
      }
    } catch (err) {
      console.error('AI 추천 실패 (fallback 적용):', err);
      // API 호출 실패 시 클라이언트 fallback 컷 적용
      const fallbackRaw = getFallbackCuts(selections?.purpose, selections?.topics);
      let startTime = 0;
      const fallbackCuts = fallbackRaw.map((cut, i) => {
        const seconds = parseInt(cut.time) || 2;
        const result = {
          id: i + 1,
          title: cut.title,
          description: '',
          time: cut.time,
          startTime,
        };
        startTime += seconds;
        return result;
      });
      setAiCuts(fallbackCuts);
      setMemos({});
      setActiveCutId(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    logScreenView('story_planning');
  }, []);

  // 스크롤 로그 (디바운스 500ms)
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      const scrollPercent = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      logScroll('story_planning', scrollPercent);
    }, 500);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [handleScroll]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        logButtonClick('story_planning', 'video_pause');
      } else {
        videoRef.current.play();
        logButtonClick('story_planning', 'video_play');
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCutSelect = (cut) => {
    setActiveCutId(cut.id);
    logButtonClick('story_planning', 'cut_select', String(cut.id));
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

  // 프로그레스 바 구간 비율 - 컷의 time 값에서 동적 계산
  const progressWidths = cuts.map(cut => parseInt(cut.time) || 2);

  const handleBack = () => {
    logButtonClick('story_planning', 'back');
    onBack();
  };

  return (
    <div className="story-planning-container">
      {/* 전체 스크롤 영역 */}
      <div className="story-scroll-content" ref={scrollRef}>
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
            <div className="story-header-row">
              <h2 className="story-title">스토리 기획</h2>
              <button
                className="sp-ai-recommend-btn"
                onClick={handleAiRecommend}
                disabled={aiLoading}
              >
                {aiLoading ? '추천 중...' : '✨ AI 추천'}
              </button>
            </div>
            <p className="story-description">각 컷에 넣을 장면을 미리 생각해보고 적어보세요.</p>
          </div>

          {/* 컷 리스트 */}
          <div className="sp-cut-list-container">
            {cuts.map((cut, index) => (
              <div
                key={cut.id}
                className={`sp-cut-item ${
                  activeCutId === cut.id
                    ? 'sp-cut-item-active'
                    : memos[cut.id]?.trim()
                      ? 'sp-cut-item-filled'
                      : ''
                }`}
                onClick={() => handleCutSelect(cut)}
              >
                <div className="sp-cut-number">{index + 1}</div>
                <div className="sp-cut-content">
                  <div className="sp-cut-header">
                    <span className="sp-cut-title">{cut.title}</span>
                    <Chip variant="time">{cut.time}</Chip>
                  </div>
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
            <Button variant="secondary" onClick={handleCancel}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSave}>
              저장하기
            </Button>
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
              <Button variant="secondary" fullWidth onClick={handleCloseModal}>
                아니요
              </Button>
              <Button variant="primary" fullWidth onClick={handleConfirmSave}>
                저장하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoryPlanningScreen;
