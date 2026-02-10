import { useState, useEffect, useRef } from 'react';
import './EditScreen.css';
import { logScreenView, logButtonClick } from '../utils/logger';

const defaultCuts = [
  { id: 1, title: '인트로 (첫 장면)', duration: 6, description: '성수동 자주 가는 카페에서 분위기 있게 셀카 찍기' },
  { id: 2, title: '제품 보여주기', duration: 4, description: '제품이 손이나 얼굴에 닿는 순간만 보여줘도 좋아요.' },
  { id: 3, title: '사용 장면', duration: 5, description: '이 제품의 특징이 잘 보이는 부분을 담아요.' },
  { id: 4, title: '리액션 컷', duration: 5, description: '사용 후 만족스러운 표정이나 반응을 보여주세요.' },
  { id: 5, title: '마무리 컷', duration: 8, description: '제품과 함께 자연스러운 엔딩 장면을 담아요.' },
  { id: 6, title: '엔딩 장면', duration: 5, description: '영상의 마지막을 장식하는 인상적인 엔딩을 담아요.' },
];

// 시간 형식 변환 (초 → "Xs")
const formatTime = (seconds) => `${seconds}s`;


function EditScreen({ template, onBack, onComplete, savedMemos = {} }) {
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [cutData, setCutData] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedAiIndex, setSelectedAiIndex] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    logScreenView('edit_screen');

    // 아이디어 노트 메모를 컷에 매핑
    // IdeaNoteScreen: 1=인트로, 2=중간(2-5컷), 3=마무리
    // EditScreen: 1-6 개별 컷
    const getMemoForCut = (cutIndex) => {
      const totalCuts = defaultCuts.length;
      if (cutIndex === 0) {
        return savedMemos[1] || '';  // 인트로
      } else if (cutIndex === totalCuts - 1) {
        return savedMemos[3] || '';  // 마무리
      } else {
        return savedMemos[2] || '';  // 중간 컷들
      }
    };

    setCutData(defaultCuts.map((cut, index) => ({
      ...cut,
      videoFile: null,
      videoPreview: null,
      subtitle: '',
      memo: getMemoForCut(index),  // 아이디어 노트 메모 반영
    })));
  }, [savedMemos]);

  const currentCut = cutData[currentCutIndex];
  const totalCuts = cutData.length;
  // 총 재생시간 계산
  const totalSeconds = cutData.reduce((sum, cut) => sum + (cut.duration || 0), 0);
  const totalDuration = `00:${String(totalSeconds).padStart(2, '0')}`;

  // 썸네일 생성
  const generateThumbnail = (videoUrl, cutIndex) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;

    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.5;
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
      setThumbnails(prev => ({ ...prev, [cutIndex]: thumbnailUrl }));
    });
  };

  // 컷 선택
  const handleCutSelect = (index) => {
    logButtonClick('edit_screen', `cut_${index + 1}`);
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentCutIndex(index);
    setAiSuggestions([]);
    setSelectedAiIndex(null);
  };

  // 뒤로가기
  const handleBack = () => {
    logButtonClick('edit_screen', 'back');
    onBack();
  };

  // 영상 추가 버튼 클릭 (플러스 아이콘)
  const handleVideoAddClick = () => {
    logButtonClick('edit_screen', 'video_add');
    fileInputRef.current?.click();
  };

  // 영상 교체 버튼 클릭 (편집 아이콘)
  const handleVideoReplaceClick = () => {
    logButtonClick('edit_screen', 'video_replace');
    fileInputRef.current?.click();
  };

  // 영상 업로드
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      logButtonClick('edit_screen', 'video_upload', file.name);
      const videoUrl = URL.createObjectURL(file);
      setCutData(prev => prev.map((cut, index) =>
        index === currentCutIndex
          ? { ...cut, videoFile: file, videoPreview: videoUrl }
          : cut
      ));
      generateThumbnail(videoUrl, currentCutIndex);
    }
  };

  // 재생/정지
  const handlePlayToggle = () => {
    logButtonClick('edit_screen', isPlaying ? 'pause' : 'play');
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // AI 자막 추천
  const handleAISubtitle = async () => {
    logButtonClick('edit_screen', 'ai_subtitle');
    setIsLoadingAI(true);
    setAiSuggestions([]);
    setSelectedAiIndex(null);

    try {
      // AI 자막 생성 API 호출 (Netlify Function) - 텍스트 기반
      const response = await fetch('/.netlify/functions/generate-subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cutTitle: currentCut?.title || '',
          cutDescription: currentCut?.description || '',
          memo: currentCut?.memo || '',
          userKeyword: currentCut?.subtitle || '',
        }),
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      const subtitles = data.subtitles || [];
      setAiSuggestions(subtitles);

      // 자막이 비어있으면 가장 좋은 안(첫번째)을 자동으로 입력
      if (!currentCut?.subtitle && subtitles.length > 0) {
        setSelectedAiIndex(0);
        setCutData(prev => prev.map((cut, i) =>
          i === currentCutIndex ? { ...cut, subtitle: subtitles[0] } : cut
        ));
      }
    } catch (error) {
      console.error('AI 자막 생성 오류:', error);
      const fallbackSubtitles = [
        '지금 바로 확인해보세요!',
        '이 순간을 놓치지 마세요!',
        '함께 즐겨보세요!',
      ];
      setAiSuggestions(fallbackSubtitles);

      // 자막이 비어있으면 가장 좋은 안(첫번째)을 자동으로 입력
      if (!currentCut?.subtitle) {
        setSelectedAiIndex(0);
        setCutData(prev => prev.map((cut, i) =>
          i === currentCutIndex ? { ...cut, subtitle: fallbackSubtitles[0] } : cut
        ));
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI 추천 선택
  const handleSelectAiSuggestion = (suggestion, index) => {
    logButtonClick('edit_screen', `ai_suggestion_${index + 1}`);
    setSelectedAiIndex(index);
    setCutData(prev => prev.map((cut, i) =>
      i === currentCutIndex ? { ...cut, subtitle: suggestion } : cut
    ));
  };

  // 자막 직접 입력
  const handleSubtitleChange = (e) => {
    const value = e.target.value;
    setCutData(prev => prev.map((cut, index) =>
      index === currentCutIndex ? { ...cut, subtitle: value } : cut
    ));
    setAiSuggestions([]);
    setSelectedAiIndex(null);
  };

  // 저장하기
  const handleSave = () => {
    logButtonClick('edit_screen', 'save');
    const saveData = {
      cutData: cutData.map(cut => ({
        id: cut.id,
        title: cut.title,
        subtitle: cut.subtitle,
      })),
      currentCutIndex,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('edit_screen_progress', JSON.stringify(saveData));
    setShowSaveModal(true);
  };

  // 저장 모달 닫기
  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };

  // 완료
  const handleComplete = () => {
    logButtonClick('edit_screen', 'complete');
    if (onComplete) {
      // 영상이 업로드된 컷만 필터링하여 VideoEditor로 전달
      const cutsWithVideo = cutData
        .map((cut, index) => ({ cut, index }))
        .filter(({ cut }) => cut.videoPreview)  // 영상이 있는 컷만
        .map(({ cut, index }) => ({
          id: cut.id,
          title: cut.title,
          duration: cut.duration,
          description: cut.description,
          videoUrl: cut.videoPreview,
          thumbnail: thumbnails[index] || null,
          subtitle: cut.subtitle,
        }));

      if (cutsWithVideo.length === 0) {
        alert('최소 1개 이상의 영상을 추가해주세요.');
        return;
      }

      onComplete(cutsWithVideo);
    }
  };

  if (!currentCut) {
    return (
      <div className="content-upload-b">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="content-upload-b">
      {/* 저장 완료 모달 */}
      {showSaveModal && (
        <div className="cub-save-modal-overlay" onClick={handleCloseSaveModal}>
          <div className="cub-save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cub-save-modal-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="12" width="20" height="24" rx="2" fill="#F8FF33"/>
                <rect x="20" y="8" width="20" height="24" rx="2" fill="#E8EF23"/>
                <path d="M26 18L30 22L38 14" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="cub-save-modal-title">자막이 저장되었습니다!</h3>
            <p className="cub-save-modal-subtitle">영상이 있으면 편집을 시작할 수 있어요.</p>
            <button className="cub-save-modal-btn" onClick={handleCloseSaveModal}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="cub-header">
        <button className="cub-back-btn" onClick={handleBack}>
          ‹
        </button>
        <span className="cub-title">{template?.title || '작업하기 좋은 카페 추천'}</span>
      </div>

      {/* 컷 타임라인 */}
      <div className="cub-timeline">
        <div className="cub-timeline-scroll">
          {cutData.map((cut, index) => (
            <button
              key={cut.id}
              className={`cub-cut-card ${index === currentCutIndex ? 'active' : ''}`}
              onClick={() => handleCutSelect(index)}
            >
              {/* 썸네일 이미지 (있으면 표시) */}
              {thumbnails[index] && (
                <img src={thumbnails[index]} alt={`컷 ${index + 1}`} className="cub-cut-thumb-img" />
              )}
              {/* 숫자 오버레이 (항상 표시) */}
              <span className="cub-cut-number-overlay">{index + 1}</span>
              {/* 시간 오버레이 (항상 표시) */}
              <span className="cub-cut-time-overlay">{formatTime(cut.duration)}</span>
            </button>
          ))}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* 메인 프리뷰 영역 */}
      <div className="cub-preview">
        {currentCut.videoPreview ? (
          <video
            ref={videoRef}
            src={currentCut.videoPreview}
            className="cub-preview-video"
            preload="auto"
            playsInline
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="cub-preview-placeholder" onClick={handleVideoAddClick}>
            <div className="cub-mobile-frame">
              <img src="/icons/plus.png" alt="+" className="cub-plus-icon" />
            </div>
          </div>
        )}

        {/* 왼쪽 상단 정보 */}
        <div className="cub-preview-info">
          <div className="cub-info-badge">
            <img src="/images/meta-icons/01_time.png" alt="" />
            {totalDuration}
          </div>
          <div className="cub-info-badge">
            <img src="/icons/film.png" alt="" />
            {totalCuts}
          </div>
        </div>

        {/* 재생 버튼 */}
        <button className="cub-play-btn" onClick={handlePlayToggle}>
          <img src={isPlaying ? '/icons/video-stop.png' : '/icons/PLAY.png'} alt="" />
        </button>

        {/* 편집 버튼 (영상 교체) */}
        <button className="cub-edit-btn" onClick={handleVideoReplaceClick}>
          <img src="/icons/edit.png" alt="" />
        </button>
      </div>

      {/* 메인 스크롤 영역 */}
      <div className="cub-main">
        {/* 컷 정보 카드 */}
        <div className="cub-cut-info">
          <div className="cub-cut-badge">
            <img src="/icons/film_selected.png" alt="" className="cub-cut-icon" />
            <span className="cub-cut-number">{currentCutIndex + 1}</span>
          </div>
          <div className="cub-cut-text">
            <span className="cub-cut-title">{currentCut.title}</span>
            <p className="cub-cut-desc">{currentCut.description}</p>
          </div>
        </div>

        {/* 자막 작성 섹션 */}
        <div className="cub-subtitle-section">
          <div className="cub-subtitle-header">
            <span className="cub-subtitle-label">자막 작성</span>
            <button
              className="cub-ai-btn"
              onClick={handleAISubtitle}
              disabled={isLoadingAI}
            >
              {isLoadingAI ? (
                <>
                  <span className="spinner"></span>
                  생성 중...
                </>
              ) : aiSuggestions.length > 0 ? (
                <><img src="/icons/AI_Recomment_02.png" alt="" className="cub-ai-btn-icon" /> AI 자막 추천</>
              ) : (
                <><img src="/icons/AI_Recomment_01.png" alt="" className="cub-ai-btn-icon" /> AI 자막 추천</>
              )}
            </button>
          </div>

          {/* 자막 입력 */}
          <input
            type="text"
            className="cub-subtitle-input"
            placeholder="자막을 입력해주세요."
            value={currentCut.subtitle || ''}
            onChange={handleSubtitleChange}
          />

          {/* AI 추천 자막 */}
          {aiSuggestions.length > 0 && (
            <div className="cub-ai-suggestions">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`cub-ai-suggestion ${selectedAiIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectAiSuggestion(suggestion, index)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 액션 버튼 - 고정 */}
      <div className="cub-footer">
        <button className="cub-btn-secondary" onClick={handleSave}>
          저장하기
        </button>
        <button className="cub-btn-primary" onClick={handleComplete}>
          바로 편집 시작하기
        </button>
      </div>
    </div>
  );
}

export default EditScreen;
