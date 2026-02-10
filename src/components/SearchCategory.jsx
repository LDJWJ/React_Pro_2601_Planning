import { useState, useEffect } from 'react';
import './SearchCategory.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 카테고리 데이터
const categories = [
  { id: 'daily', name: '일상기록', icon: '/images/category-icons/01_life.png' },
  { id: 'travel', name: '여행', icon: '/images/category-icons/02_trabel.png' },
  { id: 'fashion', name: '패션·뷰티', icon: '/images/category-icons/03_fashion.png' },
  { id: 'promotion', name: '홍보', icon: '/images/category-icons/04_marketing.png' },
  { id: 'food', name: '맛집·카페', icon: '/images/category-icons/05_food.png' },
  { id: 'tips', name: '정보·꿀팁', icon: '/images/category-icons/06_info.png' },
  { id: 'challenge', name: '챌린지·밈', icon: '/images/category-icons/07_challenge.png' },
  { id: 'fitness', name: '운동·건강', icon: '/images/category-icons/08_health.png' },
];

// 추천 템플릿 데이터
const recommendedTemplates = [
  {
    id: 1,
    title: '혼자하는 여행 브이로그',
    users: 143,
    duration: '01:16',
    cuts: 12,
    image: '/images/templates/일본여행1.svg',
    tags: ['일상', '브이로그', '여행']
  },
  {
    id: 2,
    title: '유니크한 소품샵 소개',
    users: 218,
    duration: '00:18',
    cuts: 6,
    image: '/images/templates/Seoul1.svg',
    tags: ['소품', '인테리어', '홍보']
  },
  {
    id: 3,
    title: '작업하기 좋은 카페 추천',
    users: 326,
    duration: '00:33',
    cuts: 6,
    image: '/images/templates/tewaje.svg',
    tags: ['카페', '맛집', '브이로그']
  },
  {
    id: 4,
    title: '가성비 해외여행 코스 소개',
    users: 219,
    duration: '00:47',
    cuts: 9,
    image: '/images/templates/travel2.svg',
    tags: ['여행', '해외', '정보']
  },
];

function SearchCategory({ onTabChange, user }) {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    logScreenView('search_category');
  }, []);

  const handleSearch = () => {
    logButtonClick('search_category', 'search_bar');
  };

  const handleCategoryClick = (category) => {
    logButtonClick('search_category', 'category', category.name);
    if (onTabChange) {
      onTabChange('categoryDetail', { category });
    }
  };

  const handleTemplateClick = (template) => {
    logButtonClick('search_category', 'template', template.id);
    if (onTabChange) {
      onTabChange('templateDetail', { template });
    }
  };

  const handleBookmarkClick = (e, templateId) => {
    e.stopPropagation();
    logButtonClick('search_category', 'bookmark', templateId);
    setBookmarkedIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const userName = user?.name?.split(' ')[0] || '민지';

  return (
    <div className="search-category-container">
      {/* 검색창 */}
      <div className="sc-search-section">
        <div className="sc-search-bar" onClick={handleSearch}>
          <span className="sc-search-icon">🔍</span>
          <span className="sc-search-placeholder">원하는 템플릿을 검색해보세요</span>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className="sc-category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            className="sc-category-item"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="sc-category-icon-wrapper">
              <img className="sc-category-icon" src={category.icon} alt={category.name} />
            </div>
            <span className="sc-category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* 추천 템플릿 섹션 */}
      <div className="sc-recommend-section">
        <h3 className="sc-recommend-title">{userName}님을 위한 추천 템플릿🔥</h3>

        <div className="sc-template-grid">
          {recommendedTemplates.map((template) => (
            <div
              key={template.id}
              className="sc-template-card"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="sc-template-thumbnail">
                <img
                  src={template.image}
                  alt={template.title}
                  className="sc-template-image"
                />
                {/* 북마크 버튼 */}
                <button
                  className="sc-bookmark-btn"
                  onClick={(e) => handleBookmarkClick(e, template.id)}
                >
                  <img
                    src={bookmarkedIds.includes(template.id)
                      ? '/images/bookmark/bookmark_filled.png'
                      : '/images/bookmark/bookmark_basic.png'}
                    alt="bookmark"
                    width="20"
                    height="20"
                  />
                </button>
                {/* 사용자 수 뱃지 */}
                <div className="sc-users-badge">
                  <img src="/images/meta-icons/03_pick.png" alt="users" width="12" height="12" />
                  <span>{template.users}명</span>
                </div>
              </div>
              {/* 템플릿 정보 */}
              <div className="sc-template-info">
                <h4 className="sc-template-title">{template.title}</h4>
                <div className="sc-template-meta">
                  <span className="sc-meta-item">
                    <img src="/images/meta-icons/02_media.png" alt="cuts" width="12" height="12" />
                    {template.cuts}컷
                  </span>
                  <span className="sc-meta-dot">·</span>
                  <span className="sc-meta-item">
                    <img src="/images/meta-icons/01_time.png" alt="duration" width="12" height="12" />
                    {template.duration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchCategory;
