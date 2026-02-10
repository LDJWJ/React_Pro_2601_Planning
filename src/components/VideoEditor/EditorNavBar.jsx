import './EditorNavBar.css';

const TABS = [
  { id: 'media', icon: '/images/editor/01_flim.png', label: '미디어' },
  { id: 'filter', icon: '/images/editor/02_star.png', label: '필터' },
  { id: 'bgm', icon: '/images/editor/music.png', label: '배경음악' },
  { id: 'voice', icon: '/images/editor/mic.png', label: '보이스' },
  { id: 'subtitle', icon: '/images/editor/text.png', label: '자막' },
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
          <img src={tab.icon} alt="" className="ve-navbar-tab-icon" />
          <span className="ve-navbar-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default EditorNavBar;
