import { useState } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import CategoryPurpose from './components/CategoryPurpose';
import CategoryTopic from './components/CategoryTopic';
import CategoryPlatform from './components/CategoryPlatform';
import Home from './components/Home';
import SearchCategory from './components/SearchCategory';
import TemplateDetail from './components/TemplateDetail';
import StoryPlanningScreen from './components/StoryPlanningScreen';
import IdeaNoteScreen from './components/IdeaNoteScreen';
import ContentUploadScreen from './components/ContentUploadScreen';
import EditScreen from './components/EditScreen';
import BottomNavigation from './components/BottomNavigation';
import VideoEditor from './components/VideoEditor/VideoEditor';
import CategoryDetail from './components/CategoryDetail';

function App() {
  const [currentScreen, setCurrentScreen] = useState('purpose'); // TODO: 개발 완료 후 'login'으로 복원
  const [activeTab, setActiveTab] = useState('home');
  const [previousTab, setPreviousTab] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [savedMemos, setSavedMemos] = useState(() => {
    try {
      const stored = localStorage.getItem('storyPlanningMemos');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [editorCuts, setEditorCuts] = useState(null);
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

  const handleTabChange = (tab, data) => {
    if (data?.videoUrl) {
      setSelectedVideoUrl(data.videoUrl);
    }
    if (data?.template) {
      setSelectedTemplate(data.template);
    }
    if (data?.category) {
      setSelectedCategory(data.category);
    }
    // templateDetail로 이동할 때 이전 탭 저장
    if (tab === 'templateDetail') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tab);
  };

  const handleEditorBack = () => {
    setEditorCuts(null);
    setActiveTab('home');
  };

  const handleTemplateDetailBack = () => {
    if (selectedCategory) {
      setActiveTab('categoryDetail');
    } else if (previousTab) {
      setActiveTab(previousTab);
    } else {
      setActiveTab('home');
    }
    setSelectedTemplate(null);
    setPreviousTab(null);
  };

  const handleCategoryDetailBack = () => {
    setActiveTab('template');
    setSelectedCategory(null);
  };

  const handleStoryPlanning = (template) => {
    setSelectedTemplate(template);
    setActiveTab('ideaNote');
  };

  const handleStoryPlanningBack = () => {
    setActiveTab('templateDetail');
  };

  const handleIdeaNoteBack = () => {
    setActiveTab('templateDetail');
  };

  const handleIdeaNoteSave = (memos) => {
    if (!selectedTemplate?.id) return;
    const templateId = String(selectedTemplate.id);
    const updated = { ...savedMemos, [templateId]: memos };
    setSavedMemos(updated);
    try {
      localStorage.setItem('storyPlanningMemos', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
    }
  };

  const handleStoryPlanningSave = (memos) => {
    if (!selectedTemplate?.id) return;
    const templateId = String(selectedTemplate.id);
    const updated = { ...savedMemos, [templateId]: memos };
    setSavedMemos(updated);
    try {
      localStorage.setItem('storyPlanningMemos', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage 저장 실패:', e);
    }
  };

  const handleContentUpload = (template) => {
    setSelectedTemplate(template);
    setActiveTab('contentUpload');
  };

  const handleContentUploadBack = () => {
    setActiveTab('templateDetail');
  };

  const handleContentUploadNext = (cutData) => {
    console.log('콘텐츠 업로드 완료:', cutData);
    // 에디터로 이동
    setActiveTab('editor');
  };

  const handleStoryEdit = (template) => {
    setSelectedTemplate(template);
    setActiveTab('storyEdit');
  };

  const handleStoryEditBack = () => {
    setActiveTab('templateDetail');
  };

  const handleStoryEditComplete = (cuts) => {
    console.log('스토리 편집 완료:', cuts);
    setEditorCuts(cuts);
    setActiveTab('editor');
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Home
            user={user}
            selections={selections}
            onLogout={handleLogout}
            onTabChange={handleTabChange}
          />
        );
      case 'template':
        return <SearchCategory onTabChange={handleTabChange} user={user} />;
      case 'categoryDetail':
        return (
          <CategoryDetail
            category={selectedCategory}
            onBack={handleCategoryDetailBack}
            onTabChange={handleTabChange}
          />
        );
      case 'templateDetail':
        return (
          <TemplateDetail
            template={selectedTemplate}
            onBack={handleTemplateDetailBack}
            onTabChange={handleTabChange}
            onStoryPlanning={handleStoryPlanning}
            onStoryEdit={handleStoryEdit}
            onContentUpload={handleContentUpload}
            hasIdeaNote={!!savedMemos[String(selectedTemplate?.id)]}
          />
        );
      case 'storyPlanning':
        return (
          <StoryPlanningScreen
            template={selectedTemplate}
            onBack={handleStoryPlanningBack}
            onSave={handleStoryPlanningSave}
            initialMemos={savedMemos[String(selectedTemplate?.id)] || {}}
            selections={selections}
          />
        );
      case 'ideaNote':
        return (
          <IdeaNoteScreen
            template={selectedTemplate}
            onBack={handleIdeaNoteBack}
            onSave={handleIdeaNoteSave}
          />
        );
      case 'storyEdit':
        return (
          <EditScreen
            template={selectedTemplate}
            onBack={handleStoryEditBack}
            onComplete={handleStoryEditComplete}
            savedMemos={savedMemos[String(selectedTemplate?.id)] || {}}
          />
        );
      case 'contentUpload':
        return (
          <ContentUploadScreen
            template={selectedTemplate}
            onBack={handleContentUploadBack}
            onNext={handleContentUploadNext}
            savedMemos={savedMemos[String(selectedTemplate?.id)] || {}}
          />
        );
      case 'editor':
        return (
          <VideoEditor
            cuts={editorCuts || []}
            onBack={handleEditorBack}
            projectName={selectedTemplate?.title}
          />
        );
      case 'mypage':
        return (
          <div style={{ padding: '100px 20px', textAlign: 'center', color: '#999' }}>
            마이페이지 화면 준비 중
          </div>
        );
      default:
        return (
          <Home
            user={user}
            selections={selections}
            onLogout={handleLogout}
            onTabChange={handleTabChange}
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
            {activeTab !== 'templateDetail' && activeTab !== 'categoryDetail' && activeTab !== 'storyPlanning' && activeTab !== 'ideaNote' && activeTab !== 'storyEdit' && activeTab !== 'contentUpload' && !(activeTab === 'editor' && editorCuts) && (
              <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
            )}
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