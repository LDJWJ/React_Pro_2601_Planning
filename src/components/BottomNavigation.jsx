import './BottomNavigation.css';

function BottomNavigation({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'home',
      label: '홈',
      icon: '/images/nav/01_home.png',
      iconActive: '/images/nav/01_home_selected.png',
      needsFilter: false,
    },
    {
      id: 'template',
      label: '템플릿',
      icon: '/images/nav/02_template_selected.png',
      iconActive: '/images/nav/02_template_no_selected.png',
      needsFilter: false,
    },
    {
      id: 'editor',
      label: '편집',
      icon: '/images/nav/03_edits.png',
      iconActive: '/images/nav/03_edits.png',
      needsFilter: true,
    },
    {
      id: 'mypage',
      label: '마이',
      icon: '/images/nav/04_Icons.png',
      iconActive: '/images/nav/04_Icons.png',
      needsFilter: true,
    },
  ];

  return (
    <nav className="bottom-navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="nav-icon">
              <img
                src={isActive ? tab.iconActive : tab.icon}
                alt={tab.label}
                width="24"
                height="24"
                className={tab.needsFilter ? 'needs-filter' : ''}
              />
            </span>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
