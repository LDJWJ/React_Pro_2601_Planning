import { useState, useEffect, useRef, useCallback } from 'react';
import './ContentUploadScreen.css';
import { logScreenView, logButtonClick, logScroll } from '../utils/logger';

function ContentUploadScreen({ template, onBack, onNext, savedMemos }) {
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [cutData, setCutData] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const fileInputRef = useRef(null);
  const mainScrollRef = useRef(null);
  const scrollTimerRef = useRef(null);

  // 템플릿의 컷 데이터 초기화
  useEffect(() => {
    logScreenView('content_upload');

    if (template?.cutDetails) {
      setCutData(template.cutDetails.map(cut => ({
        ...cut,
        videoFile: null,
        videoPreview: null,
        subtitle: '',
        memo: savedMemos?.[cut.id] || cut.memo || '',
      })));
    } else {
      const defaultCuts = [
        { id: 1, title: '착석 후 첫 컷', duration: '2초', description: '인물 + 커피 마시기 (상반신)', memo: '' },
        { id: 2, title: '테이블 무드', duration: '2초', description: '소지품 + 커피 (줌 인)', memo: '' },
        { id: 3, title: '인물 리액션', duration: '1초', description: '착석 리액션 컷 (상반신)', memo: '' },
        { id: 4, title: '음식 클로즈업', duration: '2초', description: '음식 촬영 (탑뷰)', memo: '' },
        { id: 5, title: '분위기 컷', duration: '2초', description: '카페 내부 전경', memo: '' },
        { id: 6, title: '마무리 컷', duration: '1초', description: '인물 + 손인사 (상반신)', memo: '' },
      ];
      setCutData(defaultCuts.map(cut => ({
        ...cut,
        videoFile: null,
        videoPreview: null,
        subtitle: '',
        memo: savedMemos?.[cut.id] || cut.memo || '',
      })));
    }
  }, [template]);

  // 스크롤 로그 (디바운스 500ms)
  const handleScroll = useCallback(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const scrollPercent = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      logScroll('content_upload', scrollPercent);
    }, 500);
  }, []);

  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [handleScroll]);

  const currentCut = cutData[currentCutIndex];
  const totalCuts = cutData.length;

  // 영상에서 썸네일 프레임 추출
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

  // "2초" → "2s" 변환
  const parseDuration = (durationStr) => {
    if (!durationStr) return '';
    const match = durationStr.match(/(\d+)/);
    return match ? `${match[1]}s` : durationStr;
  };

  // 타임라인 클릭 시 컷 전환
  const handleTimelineCutSelect = (index) => {
    logButtonClick('content_upload', 'timeline_cut_select', String(index + 1));
    setAiSuggestions([]);
    setSelectedSuggestionIndex(null);
    setCurrentCutIndex(index);
  };

  // duration 칩 클릭 시 컷 전환
  const handleDurationChipSelect = (index) => {
    logButtonClick('content_upload', 'duration_chip_select', String(index + 1));
    setAiSuggestions([]);
    setSelectedSuggestionIndex(null);
    setCurrentCutIndex(index);
  };

  // 뒤로가기
  const handleBack = () => {
    logButtonClick('content_upload', 'back');
    onBack();
  };

  // 영상 업로드 (선택적 targetIndex)
  const handleVideoUpload = (e, targetIndex) => {
    const file = e.target.files[0];
    if (file) {
      logButtonClick('content_upload', 'video_upload');
      const videoUrl = URL.createObjectURL(file);
      const idx = targetIndex !== undefined ? targetIndex : currentCutIndex;
      setCutData(prev => prev.map((cut, index) =>
        index === idx
          ? { ...cut, videoFile: file, videoPreview: videoUrl }
          : cut
      ));
      generateThumbnail(videoUrl, idx);
    }
  };

  const handleSubtitleChange = (e) => {
    const value = e.target.value;
    setCutData(prev => prev.map((cut, index) =>
      index === currentCutIndex
        ? { ...cut, subtitle: value }
        : cut
    ));
  };

  const handleAISubtitle = async () => {
    logButtonClick('content_upload', 'ai_subtitle');
    setIsLoadingAI(true);
    setAiSuggestions([]);
    setSelectedSuggestionIndex(null);

    try {
      const response = await fetch('/.netlify/functions/generate-subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cutTitle: currentCut?.title || '',
          cutDescription: currentCut?.description || '',
          memo: currentCut?.memo || '',
          templateTitle: template?.title || '',
          templateCategory: template?.category || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate subtitles');
      }

      const data = await response.json();
      setAiSuggestions(data.subtitles || []);
    } catch (error) {
      console.error('AI 자막 생성 오류:', error);
      setAiSuggestions([
        '지금 바로 확인해보세요!',
        '이 순간을 놓치지 마세요!',
        '함께 즐겨보세요!',
      ]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSelectSuggestion = (suggestion, index) => {
    logButtonClick('content_upload', 'ai_suggestion_select', suggestion);
    setSelectedSuggestionIndex(index);
    setCutData(prev => prev.map((cut, i) =>
      i === currentCutIndex
        ? { ...cut, subtitle: suggestion }
        : cut
    ));
  };

  // + 버튼 (영상 추가 파일 선택 트리거)
  const handleAddVideoButton = () => {
    logButtonClick('content_upload', 'add_video_button', String(currentCutIndex + 1));
    fileInputRef.current?.click();
  };

  // 자막 입력 focus
  const handleSubtitleFocus = () => {
    logButtonClick('content_upload', 'subtitle_input_focus', String(currentCutIndex + 1));
  };

  // 자막 입력 blur
  const handleSubtitleBlur = () => {
    const subtitle = cutData[currentCutIndex]?.subtitle || '';
    if (subtitle.trim()) {
      logButtonClick('content_upload', 'subtitle_input_blur', subtitle);
    }
  };

  // "완성하기" → 에디터로 이동
  const handleComplete = () => {
    logButtonClick('content_upload', 'complete');
    onNext(cutData);
  };

  // "저장하기" → localStorage 저장
  const handleSaveProgress = () => {
    logButtonClick('content_upload', 'save_progress');
    const saveData = {
      templateId: template?.id || 'default',
      cutData: cutData.map(cut => ({
        id: cut.id,
        title: cut.title,
        description: cut.description,
        duration: cut.duration,
        memo: cut.memo,
        subtitle: cut.subtitle,
      })),
      currentCutIndex,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('hookhook_progress', JSON.stringify(saveData));
    alert('진행 상황이 저장되었습니다.');
  };

  if (!currentCut) {
    return (
      <div className="content-upload-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="content-upload-container">
      {/* 상단 헤더 */}
      <div className="content-upload-header">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>
      </div>

      {/* 비디오 미리보기 영역 */}
      <div className="preview-section">
        <div className="preview-thumbnail">
          {currentCut.videoPreview ? (
            <video src={currentCut.videoPreview} className="preview-video" />
          ) : (
            <div className="preview-placeholder">영상을 추가해주세요</div>
          )}
        </div>
        <div className="preview-info">
          <span className="preview-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            {template?.duration || '00:10'}
          </span>
          <span className="preview-cuts">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            </svg>
            {totalCuts}컷
          </span>
        </div>
      </div>

      {/* 썸네일 타임라인 */}
      <div className="thumbnail-timeline-container">
        <div className="thumbnail-timeline-scroll">
          {cutData.map((cut, index) => (
            <button
              key={cut.id}
              className={`timeline-thumbnail ${index === currentCutIndex ? 'active' : ''}`}
              onClick={() => handleTimelineCutSelect(index)}
            >
              {thumbnails[index] ? (
                <img src={thumbnails[index]} alt={`컷 ${index + 1}`} />
              ) : (
                <span className="timeline-thumbnail-number">{index + 1}</span>
              )}
            </button>
          ))}

          {/* + 버튼 */}
          <button
            className="timeline-add-button"
            onClick={handleAddVideoButton}
          >
            +
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => handleVideoUpload(e, currentCutIndex)}
            style={{ display: 'none' }}
          />

          {/* 구분선 */}
          <div className="timeline-divider" />

          {/* duration 칩들 */}
          {cutData.map((cut, index) => (
            <button
              key={`dur-${cut.id}`}
              className={`timeline-duration-chip ${index === currentCutIndex ? 'active' : ''}`}
              onClick={() => handleDurationChipSelect(index)}
            >
              {parseDuration(cut.duration)}
            </button>
          ))}
        </div>
        <div className="timeline-accent-line" />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="content-upload-main" ref={mainScrollRef}>
        {/* 콘텐츠 기획 섹션 */}
        <div className="content-planning-section">
          <div className="content-planning-header">
            <span className="content-planning-label">콘텐츠 기획 📋 {currentCutIndex + 1}</span>
            <span className="content-planning-duration">{currentCut.duration}</span>
          </div>
          <div className="content-planning-card">
            <div className="planning-card-title">{currentCutIndex + 1}번째 영상 포인트</div>
            <div className="planning-card-description">{currentCut.description}</div>
            {currentCut.memo && (
              <div className="planning-card-memo">{currentCut.memo}</div>
            )}
          </div>
        </div>

        {/* 자막 섹션 (리디자인) */}
        <div className="subtitle-section-redesign">
          <div className="subtitle-header-row">
            <span className="subtitle-label">자막</span>
            <button
              className={`ai-subtitle-chip ${isLoadingAI ? 'loading' : ''}`}
              onClick={handleAISubtitle}
              disabled={isLoadingAI}
            >
              {isLoadingAI ? (
                <>
                  <span className="spinner"></span>
                  생성 중...
                </>
              ) : (
                'AI 자막 추천'
              )}
            </button>
          </div>
          <input
            type="text"
            className="subtitle-input-redesign"
            placeholder="자막을 입력하세요"
            value={currentCut.subtitle || ''}
            onChange={handleSubtitleChange}
            onFocus={handleSubtitleFocus}
            onBlur={handleSubtitleBlur}
          />

          {/* AI 추천 자막 Chips */}
          {aiSuggestions.length > 0 && (
            <div className="ai-suggestions">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={`suggestion-chip ${selectedSuggestionIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelectSuggestion(suggestion, index)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="content-upload-footer-redesign">
          <button className="complete-button" onClick={handleComplete}>
            완성하기
          </button>
          <button className="save-progress-button" onClick={handleSaveProgress}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentUploadScreen;
