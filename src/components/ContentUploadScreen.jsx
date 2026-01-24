import { useState, useEffect } from 'react';
import './ContentUploadScreen.css';
import { logScreenView, logButtonClick } from '../utils/logger';

function ContentUploadScreen({ template, onBack, onNext }) {
  const [currentCutIndex, setCurrentCutIndex] = useState(0);
  const [cutData, setCutData] = useState([]);

  // 템플릿의 컷 데이터 초기화
  useEffect(() => {
    logScreenView('content_upload');

    if (template?.cutDetails) {
      setCutData(template.cutDetails.map(cut => ({
        ...cut,
        videoFile: null,
        videoPreview: null,
        subtitle: '',
      })));
    } else {
      // 기본 컷 데이터 (템플릿에 cutDetails가 없는 경우)
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
      })));
    }
  }, [template]);

  const currentCut = cutData[currentCutIndex];
  const totalCuts = cutData.length;

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      logButtonClick('content_upload', 'video_upload');
      const videoUrl = URL.createObjectURL(file);
      setCutData(prev => prev.map((cut, index) =>
        index === currentCutIndex
          ? { ...cut, videoFile: file, videoPreview: videoUrl }
          : cut
      ));
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

  const handleAISubtitle = () => {
    logButtonClick('content_upload', 'ai_subtitle');
    // AI 추천 자막 기능 (추후 구현)
    const aiSuggestion = `AI 추천: ${currentCut?.title || '컷'} 자막`;
    setCutData(prev => prev.map((cut, index) =>
      index === currentCutIndex
        ? { ...cut, subtitle: aiSuggestion }
        : cut
    ));
  };

  const handlePrevStep = () => {
    logButtonClick('content_upload', 'prev_step');
    if (currentCutIndex > 0) {
      setCurrentCutIndex(currentCutIndex - 1);
    } else {
      onBack();
    }
  };

  const handleNextStep = () => {
    logButtonClick('content_upload', 'next_step');
    if (currentCutIndex < totalCuts - 1) {
      setCurrentCutIndex(currentCutIndex + 1);
    } else {
      // 모든 컷 완료, 에디터로 이동
      onNext(cutData);
    }
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
        <button className="back-button" onClick={onBack}>
          ←
        </button>
      </div>

      {/* 비디오 미리보기 영역 */}
      <div className="preview-section">
        <div className="preview-thumbnail">
          {currentCut.videoPreview ? (
            <video src={currentCut.videoPreview} className="preview-video" />
          ) : template?.thumbnail ? (
            <img src={template.thumbnail} alt="템플릿" className="preview-image" />
          ) : (
            <div className="preview-placeholder"></div>
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

      {/* 메인 콘텐츠 영역 */}
      <div className="content-upload-main">
        <div className="content-upload-title">
          <h2>콘텐츠를 업로드하세요</h2>
          <p>요소를 채우면 템플릿에 반영됩니다</p>
        </div>

        {/* 컷 정보 */}
        <div className="cut-info-card">
          <div className="cut-header">
            <div className="cut-number">{currentCutIndex + 1}</div>
            <div className="cut-details">
              <span className="cut-title">{currentCut.title}</span>
              <span className="cut-description">{currentCut.description}</span>
            </div>
            <span className="cut-duration">{currentCut.duration}</span>
          </div>

          {currentCut.memo && (
            <div className="cut-memo">
              {currentCut.memo}
            </div>
          )}
        </div>

        {/* 영상 추가하기 */}
        <div className="upload-section">
          <h3>영상 추가하기</h3>
          <label className="upload-button">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />
            {currentCut.videoPreview ? '영상 변경하기' : '영상 추가하기'}
          </label>
        </div>

        {/* 자막 */}
        <div className="subtitle-section">
          <h3>자막</h3>
          <input
            type="text"
            className="subtitle-input"
            placeholder="자막을 입력하세요"
            value={currentCut.subtitle || ''}
            onChange={handleSubtitleChange}
          />
          <button className="ai-subtitle-button" onClick={handleAISubtitle}>
            AI 추천자막
          </button>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="content-upload-footer">
        <button className="prev-button" onClick={handlePrevStep}>
          이전 단계
        </button>
        <button className="next-button" onClick={handleNextStep}>
          {currentCutIndex < totalCuts - 1 ? '다음' : '완료'}
        </button>
      </div>

      {/* 진행 상태 표시 */}
      <div className="progress-indicator">
        {cutData.map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index === currentCutIndex ? 'active' : ''} ${index < currentCutIndex ? 'completed' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ContentUploadScreen;
