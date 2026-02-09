import { useState, useEffect, useRef } from 'react';
import './Home.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 템플릿 더미 데이터
const templates = [
  {
    id: 1,
    title: '뷰티 체험단 후기',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=600&fit=crop',
    category: '일상 기록 숏폼',
    usageCount: 200,
    tags: ['뷰티', '브이로그', '홍보']
  },
  {
    id: 2,
    title: '여행 브이로그',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop',
    category: '여행 영상',
    usageCount: 150,
    tags: ['여행', '브이로그']
  },
  {
    id: 3,
    title: '먹방 리뷰',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=600&fit=crop',
    category: '음식 콘텐츠',
    usageCount: 180,
    tags: ['맛집', '먹방', '리뷰']
  },
  {
    id: 4,
    title: '일상 브이로그',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    category: '일상 기록',
    usageCount: 220,
    tags: ['일상', '브이로그']
  },
  {
    id: 5,
    title: '운동 루틴',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
    category: '피트니스',
    usageCount: 165,
    tags: ['운동', '건강', '루틴']
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
  };

  const handleMoreClick = () => {
    logButtonClick('home', 'more_button');
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
    const scale = adjustedDiff === 0 ? 1 : 0.85;
    const zIndex = adjustedDiff === 0 ? 3 : Math.abs(adjustedDiff) === 1 ? 2 : 1;

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      zIndex,
    };
  };

  // 사용자 이름 가져오기
  const userName = user?.name?.split(' ')[0] || '회원';

  // 현재 템플릿의 카테고리로 추천 이유 생성
  const getRecommendReason = () => {
    const currentTemplate = templates[currentIndex];
    return `${currentTemplate.category}에서 ${currentTemplate.usageCount}명이 사용했어요`;
  };

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
                {/* 텍스트 오버레이 */}
                <div className="card-overlay">
                  <span className="card-title">{template.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recommend-text">
          <h2 className="recommend-title">
            {userName}님께 지금 가장
            <br />
            추천하는 템플릿이에요
          </h2>
          <p className="recommend-reason">{getRecommendReason()}</p>
        </div>

        {/* 인디케이터 */}
        <div className="carousel-indicators">
          {templates.map((_, index) => (
            <button
              key={index}
              className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
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
            <p className="section-subtitle">어제 쇼츠에 가장 많이 업로드된 스타일이에요</p>
          </div>
          <button className="more-button" onClick={handleMoreClick}>
            더보기 &gt;
          </button>
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
                <div className="template-users">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  <span className="users-count">{template.users}</span>
                </div>
                <button className="template-bookmark" onClick={(e) => e.stopPropagation()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <div className="template-info-tags">
                  <span className="template-info-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    {template.duration}
                  </span>
                  <span className="template-info-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                    </svg>
                    {template.cuts}컷
                  </span>
                </div>
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
          더 많은 템플릿 보기
        </button>
      </div>
    </div>
  );
}

export default Home;
