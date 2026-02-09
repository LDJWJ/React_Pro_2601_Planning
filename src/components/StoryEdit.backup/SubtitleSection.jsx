import './SubtitleSection.css';

function SubtitleSection({
  subtitle,
  onSubtitleChange,
  onAIRecommend,
  isLoading,
  aiSuggestions,
  selectedSuggestionIndex,
  onSelectSuggestion,
}) {
  return (
    <div className="se-subtitle-section">
      <div className="se-subtitle-header">
        <span className="se-subtitle-label">자막</span>
        <button
          className={`se-ai-btn ${isLoading ? 'loading' : ''}`}
          onClick={onAIRecommend}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="se-spinner" />
              생성 중...
            </>
          ) : (
            'AI 자막 추천'
          )}
        </button>
      </div>
      <input
        type="text"
        className="se-subtitle-input"
        placeholder="자막을 입력해주세요"
        value={subtitle || ''}
        onChange={onSubtitleChange}
      />
      {aiSuggestions.length > 0 && (
        <div className="se-ai-suggestions">
          {aiSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`se-suggestion-chip ${selectedSuggestionIndex === index ? 'selected' : ''}`}
              onClick={() => onSelectSuggestion(suggestion, index)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubtitleSection;
