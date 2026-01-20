import { useState } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import CategoryPurpose from './components/CategoryPurpose';
import CategoryTopic from './components/CategoryTopic';
import CategoryPlatform from './components/CategoryPlatform';
import Home from './components/Home';
import SearchCategory from './components/SearchCategory';
import BottomNavigation from './components/BottomNavigation';
import Editor from './components/Editor';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [selections, setSelections] = useState({
    purpose: null,
    topics: [],
    platforms: [],
  });

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setCurrentScreen('purpose');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    setSelections({ purpose: null, topics: [], platforms: [] });
  };

  const handlePurposeNext = (purpose) => {
    setSelections((prev) => ({ ...prev, purpose }));
    setCurrentScreen('topic');
  };

  const handleTopicNext = (topics) => {
    setSelections((prev) => ({ ...prev, topics }));
    setCurrentScreen('platform');
  };

  const handlePlatformNext = (platforms) => {
    const finalSelections = { ...selections, platforms };
    setSelections(finalSelections);
    console.log('온보딩 완료:', finalSelections);
    setCurrentScreen('home');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditorBack = () => {
    setActiveTab('home');
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            user={user}
            selections={selections}
            onLogout={handleLogout}
          />
        );
      case 'search':
        return <SearchCategory />;
      case 'edit':
        return <Editor onBack={handleEditorBack} />;
      case 'my':
        return (
          <div style={{ padding: '100px 20px', textAlign: 'center', color: '#999' }}>
            MY 화면 준비 중
          </div>
        );
      default:
        return (
          <Home
            user={user}
            selections={selections}
            onLogout={handleLogout}
          />
        );
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'purpose':
        return <CategoryPurpose onNext={handlePurposeNext} />;
      case 'topic':
        return <CategoryTopic onNext={handleTopicNext} />;
      case 'platform':
        return <CategoryPlatform onNext={handlePlatformNext} />;
      case 'home':
        return (
          <>
            <div className="mobile-content">
              {renderMainContent()}
            </div>
            <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          </>
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="mobile-app-container">
      <div className="mobile-app-frame">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;