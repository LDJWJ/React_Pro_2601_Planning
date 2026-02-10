import { useState, useEffect, useRef } from 'react';
import './Home.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 템플릿 더미 데이터 (Tewaje가 중앙에 오도록 순서 배치)
const templates = [
  {
    id: 2,
    title: 'Tewaje',
    image: '/images/home/2_1_home_template02.svg',
    category: '카페',
    usageCount: 150,
    tags: ['카페', '디저트', '맛집']
  },
  {
    id: 1,
    title: '임박CC 양탈챌린지',
    image: '/images/home/2_1_home_template01.svg',
    category: '챌린지',
    usageCount: 200,
    tags: ['챌린지', '고양이', '일상']
  },
  {
    id: 3,
    title: 'Seoul',
    image: '/images/home/2_1_home_template03.svg',
    category: '쇼핑',
    usageCount: 180,
    tags: ['쇼핑', '인형', '서울']
  },
];

const weekendTemplates = [
  {
    id: 6,
    title: '주말 브이로그',
    users: 300,
    duration: '18초',
    cuts: 6,
    image: '/images/category/category01.png',
    tags: ['일상', '브이로그', '주말']
  },
  {
    id: 7,
    title: '카페 투어',
    users: 300,
    duration: '12초',
    cuts: 4,
    image: '/images/category/category02.png',
    tags: ['카페', '맛집', '투어']
  },
  {
    id: 8,
    title: '맛집 리뷰',
    users: 300,
    duration: '15초',
    cuts: 5,
    image: '/images/category/category03.png',
    tags: ['맛집', '먹방', '리뷰']
  },
];

// Top5 카테고리 탭
const top5Categories = [
  { id: 'new', label: 'NEW' },
  { id: 'trending', label: '급상승' },
  { id: 'promo', label: '홍보' },
  { id: 'food', label: '맛집' },
  { id: 'daily', label: '일상기록' },
];

// Top5 템플릿 데이터
const top5Templates = [
  {
    id: 't1',
    title: '혼자 일본여행🇯🇵',
    subtitle: '1일차',
    caption: '와 이거 개맛있다',
    image: '/images/home/TOP5_01.svg',
    category: 'new'
  },
  {
    id: 't2',
    title: '역대급 고양이 전투력',
    subtitle: '랭킹 TOP10',
    caption: '1. 생선드 기',
    image: '/images/home/TOP5_02.svg',
    category: 'trending'
  },
  {
    id: 't3',
    title: 'Tewaje',
    subtitle: '',
    caption: '새로운 맛의 발견',
    image: '/images/home/TOP5_03.svg',
    category: 'food'
  },
];

const filterTabs = [
  { id: 'recommend', label: '추천' },
  { id: 'frequent', label: '내가 자주 쓴' },
  { id: 'yesterday', label: '어제 올라온' },
];

function Home({ user, selections, onLogout, onTabChange, activeTab = 'template' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [activeFilter, setActiveFilter] = useState('recommend');
  const [activeTop5Category, setActiveTop5Category] = useState('new');
  const carouselRef = useRef(null);

  // 스와이프 감지를 위한 최소 거리
  const minSwipeDistance = 50;

  useEffect(() => {
    logScreenView('home');
  }, []);

  const handleSearch = () => {
    logButtonClick('home', 'search_bar');
  };

  const handleTemplateClick = (template, section) => {
    logButtonClick('home', `template_${section}`, template.title);
    if (onTabChange) {
      onTabChange('templateDetail', { template });
    }
  };

  // 터치 이벤트 핸들러
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 다음 카드로
      setCurrentIndex((prev) =>
        prev === templates.length - 1 ? 0 : prev + 1
      );
    }
    if (isRightSwipe) {
      // 이전 카드로
      setCurrentIndex((prev) =>
        prev === 0 ? templates.length - 1 : prev - 1
      );
    }
  };

  // 마우스 드래그 지원 (데스크톱)
  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    onTouchEnd();
    setTouchStart(null);
  };

  const onMouseLeave = () => {
    if (touchStart !== null) {
      onTouchEnd();
      setTouchStart(null);
    }
  };

  // 이미지 로드 상태 관리
  const handleImageLoad = (id) => {
    setImageLoadStatus((prev) => ({ ...prev, [id]: 'loaded' }));
  };

  const handleImageError = (id) => {
    setImageLoadStatus((prev) => ({ ...prev, [id]: 'error' }));
  };

  // 카드 스타일 계산
  const getCardClass = (index) => {
    const diff = index - currentIndex;
    const totalItems = templates.length;

    // 순환 처리
    let adjustedDiff = diff;
    if (diff > totalItems / 2) adjustedDiff = diff - totalItems;
    if (diff < -totalItems / 2) adjustedDiff = diff + totalItems;

    if (adjustedDiff === 0) return 'active';
    if (Math.abs(adjustedDiff) === 1) return 'adjacent';
    return 'hidden';
  };

  // 카드 위치 계산
  const getCardStyle = (index) => {
    const diff = index - currentIndex;
    const totalItems = templates.length;

    let adjustedDiff = diff;
    if (diff > totalItems / 2) adjustedDiff = diff - totalItems;
    if (diff < -totalItems / 2) adjustedDiff = diff + totalItems;

    const translateX = adjustedDiff * 160;
    const scale = adjustedDiff === 0 ? 1 : 0.75;
    const zIndex = adjustedDiff === 0 ? 3 : Math.abs(adjustedDiff) === 1 ? 2 : 1;

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      zIndex,
    };
  };

  // 사용자 이름 가져오기
  const userName = user?.name?.split(' ')[0] || '민지';

  return (
    <div className="home-container">
      {/* 상단 검색창 */}
      <div className="search-section">
        <div className="search-bar" onClick={handleSearch}>
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">원하는 템플릿을 검색해보세요</span>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="home-filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            className={`home-filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter(tab.id);
              logButtonClick('home', 'filter_tab', tab.label);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 메인 추천 템플릿 캐러셀 */}
      <div className="main-recommend-section">
        <div
          className="carousel-container"
          ref={carouselRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div className="carousel-track">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className={`carousel-card ${getCardClass(index)}`}
                style={getCardStyle(index)}
                onClick={() => {
                  if (index === currentIndex) {
                    handleTemplateClick(template, 'main');
                  } else {
                    setCurrentIndex(index);
                  }
                }}
              >
                {/* 스켈레톤 또는 이미지 */}
                {imageLoadStatus[template.id] !== 'loaded' && (
                  <div className="card-skeleton" />
                )}
                <img
                  src={template.image}
                  alt={template.title}
                  className="card-image"
                  style={{
                    display: imageLoadStatus[template.id] === 'loaded' ? 'block' : 'none'
                  }}
                  onLoad={() => handleImageLoad(template.id)}
                  onError={() => handleImageError(template.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="recommend-text">
          <h2 className="recommend-title">
            안녕하세요 {userName}님!
            <br />
            이 템플릿 지금 바로 써볼까요?
          </h2>
          <p className="recommend-reason">이번 주 유튜브 쇼츠에서 가장 인기있는 템플릿이에요!</p>
        </div>
      </div>

      {/* 이번 주 조회수 상위 템플릿 Top5 */}
      <div className="top5-section">
        <div className="top5-header">
          <h3 className="top5-title">이번 주 조회수 상위 템플릿 Top5🔥</h3>
          <p className="top5-subtitle">평균 조회수 상위 20%를 달성했어요!</p>
        </div>

        <div className="top5-categories">
          {top5Categories.map((category) => (
            <button
              key={category.id}
              className={`top5-category-tab ${activeTop5Category === category.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTop5Category(category.id);
                logButtonClick('home', 'top5_category', category.label);
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="top5-template-list">
          {top5Templates.map((template) => (
            <div
              key={template.id}
              className="top5-template-card"
              onClick={() => handleTemplateClick(template, 'top5')}
            >
              <img
                src={template.image}
                alt={template.title}
                className="top5-template-image"
              />
              <div className="top5-template-overlay">
                <div className="top5-template-text">
                  <span className="top5-template-title">{template.title}</span>
                  {template.subtitle && (
                    <span className="top5-template-subtitle">{template.subtitle}</span>
                  )}
                </div>
                {template.caption && (
                  <span className="top5-template-caption">{template.caption}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 추천 섹션 */}
      <div className="sub-recommend-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3 className="section-title">주말 일상 올려보는 거 어때요?</h3>
            <p className="section-subtitle">일상 기록 카테고리 중에서 가장 많이 사용된 스타일이에요!</p>
          </div>
        </div>

        <div className="template-grid">
          {weekendTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleTemplateClick(template, 'weekend')}
            >
              <div className="template-thumbnail">
                <img
                  src={template.image}
                  alt={template.title}
                  className="template-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="thumbnail-placeholder small" style={{ display: 'none' }}></div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="weekend-section-button"
          onClick={() => {
            logButtonClick('home', 'weekend_more_button');
          }}
        >
          일상기록 템플릿 더 알아보기 &gt;
        </button>
      </div>
    </div>
  );
}

export default Home;
