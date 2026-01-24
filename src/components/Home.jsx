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
    usageCount: 200
  },
  {
    id: 2,
    title: '여행 브이로그',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop',
    category: '여행 영상',
    usageCount: 150
  },
  {
    id: 3,
    title: '먹방 리뷰',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=600&fit=crop',
    category: '음식 콘텐츠',
    usageCount: 180
  },
  {
    id: 4,
    title: '일상 브이로그',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    category: '일상 기록',
    usageCount: 220
  },
  {
    id: 5,
    title: '운동 루틴',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
    category: '피트니스',
    usageCount: 165
  },
];

const weekendTemplates = [
  {
    id: 6,
    title: '주말 브이로그',
    users: 300,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop'
  },
  {
    id: 7,
    title: '카페 투어',
    users: 300,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=400&fit=crop'
  },
  {
    id: 8,
    title: '맛집 리뷰',
    users: 300,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=400&fit=crop'
  },
];

function Home({ user, selections, onLogout, onTabChange, activeTab = 'template' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
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
                  <span className="users-icon">👤</span>
                  <span className="users-count">{template.users}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
