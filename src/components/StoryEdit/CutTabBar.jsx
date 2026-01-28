import { useRef } from 'react';
import './CutTabBar.css';

function CutTabBar({ cuts, currentCutIndex, onCutSelect, onVideoUpload }) {
  const fileInputRef = useRef(null);
  const parseDuration = (durationStr) => {
    if (!durationStr) return '';
    const match = String(durationStr).match(/(\d+(\.\d+)?)/);
    return match ? `${match[1]}s` : durationStr;
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="se-cut-tab-bar">
      <div className="se-tab-scroll">
        {cuts.map((cut, index) => {
          const isCurrent = index === currentCutIndex;
          const isCompleted = cut.isCompleted;

          return (
            <button
              key={cut.id}
              className={`se-tab-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onCutSelect(index)}
            >
              {isCompleted && cut.thumbnail ? (
                <img src={cut.thumbnail} alt={`컷 ${index + 1}`} className="se-tab-thumbnail" />
              ) : isCurrent ? (
                <span className="se-tab-plus" onClick={(e) => { e.stopPropagation(); handleAddClick(); }}>+</span>
              ) : (
                <span className="se-tab-duration">{parseDuration(cut.duration)}</span>
              )}
              <span className="se-tab-number">{index + 1}</span>
            </button>
          );
        })}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        onChange={onVideoUpload}
        style={{ display: 'none' }}
      />
      <div className="se-progress-bar">
        {cuts.map((cut, index) => (
          <div
            key={cut.id}
            className={`se-progress-segment ${cut.isCompleted ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default CutTabBar;
