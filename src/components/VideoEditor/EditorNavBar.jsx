import './EditorNavBar.css';

const TABS = [
  { id: 'media', icon: '📁', label: '미디어' },
  { id: 'filter', icon: '✨', label: '필터' },
  { id: 'bgm', icon: '🎵', label: 'BGM' },
  { id: 'tts', icon: '🎤', label: 'TTS/음성' },
  { id: 'subtitle', icon: 'Aa', label: '자막' },
];

function EditorNavBar({ activeTab, onTabChange }) {
  return (
    <div className="ve-navbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`ve-navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="ve-navbar-tab-icon">{tab.icon}</span>
          <span className="ve-navbar-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default EditorNavBar;
