import './EditorHeader.css';

function EditorHeader({ onBack, onUndo, onRedo, canUndo, canRedo, onExport }) {
  return (
    <div className="ve-header">
      <div className="ve-header-left">
        <button className="ve-header-back-btn" onClick={onBack}>
          &lt;
        </button>
        <span className="ve-header-title">새 프로젝트</span>
      </div>

      <div className="ve-header-center">
        <button
          className={`ve-header-action-btn ${canUndo ? 'active' : ''}`}
          onClick={onUndo}
          disabled={!canUndo}
          title="실행 취소"
        >
          ↺
        </button>
        <button
          className={`ve-header-action-btn ${canRedo ? 'active' : ''}`}
          onClick={onRedo}
          disabled={!canRedo}
          title="다시 실행"
        >
          ↻
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
