import { useState, useEffect, useRef } from 'react';
import './IdeaNoteScreen.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 컷 수에 따라 동적으로 컷 데이터 생성
const generateCuts = (totalCuts = 6) => {
  const cuts = [];

  // 첫 구간 컷 (1컷)
  cuts.push({
    id: 1,
    label: "1",
    title: "인트로(첫 장면)",
    description: "시선을 사로잡을 수 있는 포인트를 담아주세요.",
    time: "3초",
    startTime: 0,
    thumbnail: '/images/ideanote/cut_1.png'
  });

  // 두 번째 구간 (중간 컷들: 2 ~ totalCuts-1)
  if (totalCuts > 2) {
    const middleStart = 2;
    const middleEnd = totalCuts - 1;
    cuts.push({
      id: 2,
      label: middleStart === middleEnd ? `${middleStart}` : `${middleStart} - ${middleEnd}`,
      title: "메인 콘텐츠",
      description: "이 장면에서는 핵심 내용을 담아주세요. 여러 앵글로 촬영하면 좋아요.",
      time: `${(middleEnd - middleStart + 1) * 3}초`,
      startTime: 3,
      thumbnail: '/images/ideanote/cut_3.png'
    });
  }

  // 마지막 구간 컷
  cuts.push({
    id: 3,
    label: `${totalCuts}`,
    title: "마무리 장면",
    description: "여운을 남길 수 있는 장면이에요. 분위기를 한 번 더 강조하면 좋아요.",
    time: "3초",
    startTime: (totalCuts - 1) * 3,
    thumbnail: '/images/ideanote/cut_6.png'
  });

  return cuts;
};

function IdeaNoteScreen({ template, onBack, onSave }) {
  const [memos, setMemos] = useState({});
  const [activeCutId, setActiveCutId] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef(null);
  const savingRef = useRef(false);

  // 템플릿에서 컷 수 가져오기 (기본값 6)
  const totalCuts = template?.cuts || 6;
  const cuts = generateCuts(totalCuts);

  useEffect(() => {
    logScreenView('idea_note_screen');
  }, []);

  const handleCutSelect = (cut) => {
    if (isSaving) return;
    setActiveCutId(cut.id);
    logButtonClick('idea_note_screen', 'cut_select', cut.id);
  };

  const allMemosCompleted = cuts.every(cut => memos[cut.id]?.trim());
  const activeStep = allMemosCompleted ? 2 : 1;

  const handleMemoChange = (cutId, value) => {
    if (isSaving) return;
    setMemos(prev => ({ ...prev, [cutId]: value }));
  };

  const handleMemoBlur = (cutId, value) => {
    if (isSaving) return;
    if (value && value.trim()) {
      logButtonClick('idea_note_screen', 'memo_complete', cutId);
    }
  };

  const handleSave = () => {
    if (isSaving || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);

    const memoCount = Object.values(memos).filter(memo => memo.trim() !== '').length;
    logButtonClick('idea_note_screen', 'save_button', `memos:${memoCount}`);

    if (onSave) {
      onSave(memos);
    }

    setTimeout(() => {
      setCompleted(true);
    }, 2000);
  };

  const handleBack = () => {
    logButtonClick('idea_note_screen', 'back_button');
    onBack();
  };

  const scenes = cuts.map(cut => ({ ...cut, memo: memos[cut.id] || '' }));
  const activeCount = scenes.filter(s => s.memo.trim() !== '').length;
  const isSaveEnabled = activeCount >= 1;

  const handlePopupConfirm = () => {
    setCompleted(false);
    onBack();
  };

  return (
    <div className="idea-note-container">
      <div className="idea-note-header-bar">
        <button className="idea-note-back-button" onClick={handleBack}>
          ‹
        </button>
        <span className="idea-note-header-title">아이디어 노트</span>
      </div>

      <div className="idea-note-scroll-content" ref={scrollRef}>
        <div className="idea-note-content-section">
          {/* Step 1 */}
          <div className="idea-note-step-box-left idea-note-step-box-with-line-bottom">
            <span className="idea-note-step-label">step 1</span>
            <span className={`idea-note-step-text ${activeStep === 1 ? 'active' : 'inactive'}`}>각 컷을 간단하게 메모해보세요.</span>
          </div>

          <div className="idea-note-cut-list-container">
            <div className="idea-note-timeline-wrapper">

              {cuts.map((cut, index) => {
                const isActive = activeCutId === cut.id;
                const hasMemo = memos[cut.id]?.trim();

                return (
                  <div key={cut.id} className="idea-note-timeline-row" onClick={() => handleCutSelect(cut)}>
                    {/* 왼쪽 타임라인 */}
                    <div className="idea-note-timeline-indicator">
                      <div className={`idea-note-timeline-dot ${isActive ? 'active' : ''}`} />
                      <div className={`idea-note-timeline-line ${isActive ? 'active' : ''}`} />
                    </div>

                    <div className="idea-note-cut-wrapper">
                      {/* 타이틀 행 */}
                      <div className="idea-note-cut-header-outside">
                        <div className="idea-note-cut-header-left">
                          {cut.label.includes(' - ') ? (
                            <>
                              <img src="/images/meta-icons/02_media.png" alt="" className={`idea-note-cut-icon ${isActive ? 'active' : ''}`} />
                              <span className={`idea-note-cut-label ${isActive ? 'active' : ''}`}>{cut.label.split(' - ')[0]}</span>
                              <span className={`idea-note-cut-label-separator ${isActive ? 'active' : ''}`}>-</span>
                              <img src="/images/meta-icons/02_media.png" alt="" className={`idea-note-cut-icon ${isActive ? 'active' : ''}`} />
                              <span className={`idea-note-cut-label ${isActive ? 'active' : ''}`}>{cut.label.split(' - ')[1]}</span>
                            </>
                          ) : (
                            <>
                              <img src="/images/meta-icons/02_media.png" alt="" className={`idea-note-cut-icon ${isActive ? 'active' : ''}`} />
                              <span className={`idea-note-cut-label ${isActive ? 'active' : ''}`}>{cut.label}</span>
                            </>
                          )}
                          <span className={`idea-note-cut-title ${isActive ? 'active' : ''}`}>{cut.title}</span>
                        </div>
                        {isActive && cut.time && (
                          <span className="idea-note-cut-time-tag active">{cut.startTime}초~{cut.startTime + parseInt(cut.time)}초</span>
                        )}
                      </div>

                      {/* 컷 카드 */}
                      <div className={`idea-note-cut-card ${isActive ? 'active' : ''}`}>
                        <div className={`idea-note-cut-thumbnail ${isActive ? 'active' : ''}`}>
                          <img src={cut.thumbnail} alt={`컷 ${index + 1}`} />
                          {!isActive && cut.time && (
                            <div className="idea-note-cut-thumbnail-dim">
                              <span className="idea-note-cut-thumbnail-time">{cut.time.replaceAll('초', 's')}</span>
                            </div>
                          )}
                        </div>
                        <div className="idea-note-cut-description-area">
                          {cut.description && (
                            <p className="idea-note-cut-description">{cut.description}</p>
                          )}
                        </div>
                      </div>

                      {/* 메모 표시 (비선택 시) */}
                      {!isActive && hasMemo && (
                        <div className="idea-note-memo-display-box">
                          <p className="idea-note-memo-display-text">{memos[cut.id]}</p>
                        </div>
                      )}

                      {/* 메모 섹션 (선택 시) */}
                      {isActive && (
                        <div className="idea-note-memo-section">
                          <label className="idea-note-memo-label">메모</label>
                          <textarea
                            className="idea-note-memo-input"
                            placeholder="떠오르는 생각을 자유롭게 작성해주세요"
                            value={memos[cut.id] || ''}
                            onChange={(e) => handleMemoChange(cut.id, e.target.value)}
                            onBlur={(e) => handleMemoBlur(cut.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Step 2 */}
          <div className="idea-note-step-box-left idea-note-step-box-with-line-top">
            <span className="idea-note-step-label">step 2</span>
            <span className={`idea-note-step-text ${activeStep === 2 ? 'active' : 'inactive'}`}>작성한 메모는 영상 설명으로 사용돼요.</span>
          </div>

        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="idea-note-fixed-bottom">
        <button
          className={`idea-note-save-btn ${!isSaveEnabled ? 'disabled' : ''}`}
          onClick={handleSave}
          disabled={!isSaveEnabled}
        >
          저장하기
        </button>
      </div>

      {/* 저장 완료 팝업 오버레이 */}
      {completed && (
        <div className="idea-note-popup-overlay">
          <div className="idea-note-popup">
            <img
              src="/images/ideanote/02_save_icon.png"
              alt="저장 완료"
              className="idea-note-popup-icon"
            />
            <p className="idea-note-popup-title">아이디어가 저장되었어요!</p>
            <p className="idea-note-popup-subtitle">
              <span className="idea-note-popup-highlight">영상이 있으면</span> 편집을 시작할 수 있어요.
            </p>
            <button className="idea-note-popup-btn" onClick={handlePopupConfirm}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IdeaNoteScreen;
