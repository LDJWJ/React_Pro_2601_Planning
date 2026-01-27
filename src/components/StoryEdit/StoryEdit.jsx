import { useState, useEffect, useRef } from 'react';
import './StoryEdit.css';
import CutTabBar from './CutTabBar';
import ContentPlan from './ContentPlan';
import SubtitleSection from './SubtitleSection';
import { logScreenView, logButtonClick } from '../../utils/logger';
import { saveCut, saveAllCuts, loadAllCuts } from '../../utils/storyEditDB';

const defaultCutDetails = [
  { id: 1, point: '착석 후 첫 컷', description: '인물 + 커피 마시기 (상반신)', duration: '2초' },
  { id: 2, point: '테이블 무드', description: '소지품 + 커피 (줌 인)', duration: '2초' },
  { id: 3, point: '인물 리액션', description: '착석 리액션 컷 (상반신)', duration: '1초' },
  { id: 4, point: '음식 클로즈업', description: '음식 촬영 (탑뷰)', duration: '2초' },
  { id: 5, point: '분위기 컷', description: '카페 내부 전경', duration: '2초' },
  { id: 6, point: '마무리 컷', description: '인물 + 손인사 (상반신)', duration: '1초' },
];

// AI 자막 폴백
const fallbackSubtitles = {
  default: ['지금 바로 확인해보세요!', '이 순간을 놓치지 마세요!', '함께 즐겨보세요!'],
  food: ['이 맛, 직접 확인해보세요!', '맛있는 순간을 함께!', '오늘의 추천 메뉴!'],
  mood: ['이 분위기, 느껴지시나요?', '감성 가득한 순간!', '여기가 바로 그 곳!'],
  person: ['준비됐나요?', '함께 떠나볼까요?', '오늘의 주인공!'],
};

function getFallbackSubtitles(point, description) {
  const text = `${point || ''} ${description || ''}`.toLowerCase();
  if (text.includes('음식') || text.includes('커피') || text.includes('맛')) {
    return fallbackSubtitles.food;
  }
  if (text.includes('분위기') || text.includes('무드') || text.includes('전경')) {
    return fallbackSubtitles.mood;
  }
  if (text.includes('인물') || text.includes('리액션') || text.includes('전신')) {
    return fallbackSubtitles.person;
  }
  return fallbackSubtitles.default;
}

function StoryEdit({ template, onBack, onComplete, savedMemos, user }) {
  const [cuts, setCuts] = useState([]);
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const videoRef = useRef(null);

  const userId = user?.sub || user?.email || 'anonymous';
  const templateId = String(template?.id || 'default');

  // 초기화
  useEffect(() => {
    logScreenView('story_edit');

    let initialCuts;
    if (template?.cutDetails) {
      initialCuts = template.cutDetails.map(cut => ({
        id: cut.id,
        videoUrl: null,
        thumbnail: null,
        subtitle: '',
        duration: cut.duration || cut.time || '2초',
        point: cut.title || cut.point || '',
        description: cut.description || '',
        isCompleted: false,
        _videoBlob: null,
      }));
    } else {
      const count = template?.cuts || defaultCutDetails.length;
      initialCuts = Array.from({ length: count }, (_, i) => {
        const detail = defaultCutDetails[i] || {
          id: i + 1,
          point: `컷 ${i + 1}`,
          description: '설명',
          duration: '2초',
        };
        return {
          id: detail.id,
          videoUrl: null,
          thumbnail: null,
          subtitle: '',
          duration: detail.duration,
          point: detail.point,
          description: detail.description,
          isCompleted: false,
          _videoBlob: null,
        };
      });
    }

    // savedMemos 적용
    if (savedMemos) {
      initialCuts = initialCuts.map(cut => {
        const memo = savedMemos[cut.id];
        return memo ? { ...cut, description: `${cut.description}${memo ? ` | ${memo}` : ''}` } : cut;
      });
    }

    // IndexedDB 복원 시도
    loadAllCuts(userId, templateId)
      .then(({ cuts: savedCuts, meta }) => {
        if (savedCuts && savedCuts.length > 0) {
          const savedMap = {};
          savedCuts.forEach(sc => { savedMap[sc.cutId] = sc; });

          initialCuts = initialCuts.map(cut => {
            const saved = savedMap[cut.id];
            if (saved) {
              const videoUrl = saved.videoBlob ? URL.createObjectURL(saved.videoBlob) : null;
              return {
                ...cut,
                videoUrl,
                thumbnail: saved.thumbnail || cut.thumbnail,
                subtitle: saved.subtitle || cut.subtitle,
                isCompleted: saved.isCompleted || false,
                _videoBlob: saved.videoBlob || null,
              };
            }
            return cut;
          });

          if (meta) {
            setCurrentCutIndex(meta.currentCutIndex || 0);
          }
        }
        setCuts(initialCuts);
      })
      .catch(() => {
        setCuts(initialCuts);
      });
  }, [template, savedMemos, userId, templateId]);

  const currentCut = cuts[currentCutIndex];

  // 컷 전환
  const handleCutSelect = (index) => {
    logButtonClick('story_edit', 'cut_select');
    setAiSuggestions([]);
    setSelectedSuggestionIndex(null);
    setCurrentCutIndex(index);
  };

  // 영상 업로드
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    logButtonClick('story_edit', 'video_upload');

    const videoUrl = URL.createObjectURL(file);

    // Canvas 썸네일 생성
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
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

      const cutId = cuts[currentCutIndex]?.id;
      setCuts(prev => prev.map((cut, i) =>
        i === currentCutIndex
          ? { ...cut, videoUrl, thumbnail: thumbnailUrl, isCompleted: true, _videoBlob: file }
          : cut
      ));

      // 업로드 즉시 IndexedDB에 저장 (이탈 시 데이터 보호)
      saveCut(userId, templateId, cutId, {
        videoBlob: file,
        thumbnail: thumbnailUrl,
        subtitle: cuts[currentCutIndex]?.subtitle || '',
        isCompleted: true,
      }).catch(err => console.warn('IndexedDB 컷 저장 실패:', err));
    });
  };

  // 자막 변경
  const handleSubtitleChange = (e) => {
    const value = e.target.value;
    setCuts(prev => prev.map((cut, i) =>
      i === currentCutIndex
        ? { ...cut, subtitle: value }
        : cut
    ));
  };

  // AI 자막 추천
  const handleAIRecommend = async () => {
    logButtonClick('story_edit', 'ai_subtitle');
    setIsLoadingAI(true);
    setAiSuggestions([]);
    setSelectedSuggestionIndex(null);

    try {
      const response = await fetch('/.netlify/functions/generate-subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cutTitle: currentCut?.point || '',
          cutDescription: currentCut?.description || '',
        }),
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      setAiSuggestions(data.subtitles || []);
    } catch {
      // 폴백 자막
      setAiSuggestions(getFallbackSubtitles(currentCut?.point, currentCut?.description));
    } finally {
      setIsLoadingAI(false);
    }
  };

  // AI 추천 선택
  const handleSelectSuggestion = (suggestion, index) => {
    setSelectedSuggestionIndex(index);
    setCuts(prev => prev.map((cut, i) =>
      i === currentCutIndex
        ? { ...cut, subtitle: suggestion }
        : cut
    ));
  };

  // 저장하기
  const handleSave = async () => {
    logButtonClick('story_edit', 'save');
    try {
      await saveAllCuts(userId, templateId, cuts, currentCutIndex);
    } catch (e) {
      console.warn('IndexedDB 저장 실패:', e);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 완성하기
  const handleComplete = async () => {
    logButtonClick('story_edit', 'complete');
    // 전체 저장 후 에디터로 이동
    await handleSave();
    onComplete(cuts);
  };

  if (!currentCut) {
    return (
      <div className="se-container">
        <div className="se-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="se-container">
      {/* 헤더 */}
      <div className="se-header">
        <button className="se-back-btn" onClick={onBack}>
          ←
        </button>
      </div>

      {/* 영상 미리보기 */}
      <div className="se-preview-section">
        <div className="se-phone-frame">
          {currentCut.videoUrl ? (
            <video
              ref={videoRef}
              className="se-preview-video"
              src={currentCut.videoUrl}
              playsInline
              muted
            />
          ) : (
            <div className="se-preview-placeholder">
              영상을 추가해주세요
            </div>
          )}
        </div>
      </div>

      {/* 컷 탭 바 */}
      <CutTabBar
        cuts={cuts}
        currentCutIndex={currentCutIndex}
        onCutSelect={handleCutSelect}
        onVideoUpload={handleVideoUpload}
      />

      {/* 메인 콘텐츠 */}
      <div className="se-main-content">
        <ContentPlan
          cutNumber={currentCutIndex + 1}
          duration={currentCut.duration}
          point={currentCut.point}
          description={currentCut.description}
        />

        <SubtitleSection
          subtitle={currentCut.subtitle}
          onSubtitleChange={handleSubtitleChange}
          onAIRecommend={handleAIRecommend}
          isLoading={isLoadingAI}
          aiSuggestions={aiSuggestions}
          selectedSuggestionIndex={selectedSuggestionIndex}
          onSelectSuggestion={handleSelectSuggestion}
        />

        {/* 하단 버튼 */}
        <div className="se-footer-buttons">
          <button className="se-save-btn" onClick={handleSave}>
            저장하기
          </button>
          <button className="se-complete-btn" onClick={handleComplete}>
            완성하기
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="se-toast">저장되었습니다</div>
      )}
    </div>
  );
}

export default StoryEdit;
