import './EditorHeader.css';

function EditorHeader({ onBack, onUndo, onRedo, canUndo, canRedo, onExport, projectName }) {
  return (
    <div className="ve-header">
      <div className="ve-header-left">
        <button className="ve-header-back-btn" onClick={onBack}>
          &lt;
        </button>
        <span className="ve-header-title">{projectName || '새 프로젝트'}</span>
      </div>

      <div className="ve-header-center">
        <button
          className={`ve-header-action-btn ${canUndo ? 'active' : ''}`}
          onClick={onUndo}
          disabled={!canUndo}
          title="실행 취소"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a5 5 0 0 1 5 5v2" />
            <polyline points="3 10 8 5 3 10 8 15" />
          </svg>
        </button>
        <button
          className={`ve-header-action-btn ${canRedo ? 'active' : ''}`}
          onClick={onRedo}
          disabled={!canRedo}
          title="다시 실행"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10H11a5 5 0 0 0-5 5v2" />
            <polyline points="21 10 16 5 21 10 16 15" />
          </svg>
        </button>
      </div>

      <div className="ve-header-right">
        <button className="ve-header-export-btn" onClick={onExport}>
          내보내기
        </button>
      </div>
    </div>
  );
}

export default EditorHeader;
