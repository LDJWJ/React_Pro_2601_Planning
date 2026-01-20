import { useState } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import CategoryPurpose from './components/CategoryPurpose';
import CategoryTopic from './components/CategoryTopic';
import CategoryPlatform from './components/CategoryPlatform';
import Home from './components/Home';
<<<<<<< HEAD
import SearchCategory from './components/SearchCategory';
import BottomNavigation from './components/BottomNavigation';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('home');
=======
import Editor from './components/Editor';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [activeTab, setActiveTab] = useState('template');
>>>>>>> af1caa195c7aeb6bf99f5e505818e64b2b01744c
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

<<<<<<< HEAD
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
        return (
          <div style={{ padding: '100px 20px', textAlign: 'center', color: '#999' }}>
            편집 화면 준비 중
          </div>
        );
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
=======
  const handleEditorBack = () => {
    setActiveTab('template');
>>>>>>> af1caa195c7aeb6bf99f5e505818e64b2b01744c
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
        if (activeTab === 'editor') {
          return <Editor onBack={handleEditorBack} />;
        }
        return (
<<<<<<< HEAD
          <>
            <div className="mobile-content">
              {renderMainContent()}
            </div>
            <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
          </>
=======
          <Home
            user={user}
            selections={selections}
            onLogout={handleLogout}
            onTabChange={handleTabChange}
            activeTab={activeTab}
          />
>>>>>>> af1caa195c7aeb6bf99f5e505818e64b2b01744c
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
<<<<<<< HEAD
    <div className="mobile-container">
      {renderScreen()}
=======
    <div className="mobile-app-container">
      <div className="mobile-app-frame">
        {renderScreen()}
      </div>
>>>>>>> af1caa195c7aeb6bf99f5e505818e64b2b01744c
    </div>
  );
}

export default App;
