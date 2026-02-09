import { useState, useEffect } from 'react';
import './CategoryDetail.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 필터 탭 데이터
const filterTabs = [
  { id: 'recommend', label: '추천' },
  { id: 'vlog', label: '브이로그' },
  { id: 'alone', label: '자취' },
  { id: 'couple', label: '커플' },
  { id: 'event', label: '이벤트' },
];

// 카테고리별 템플릿 데이터
const categoryTemplates = {
  daily: [
    { id: 1, title: '주말 외출 브이로그', users: 129, duration: '00:30', cuts: 8, image: '/images/category-detail/1_1_1.svg' },
    { id: 2, title: '2월의 첫 날 브이로그', users: 'NNN', duration: '00:56', cuts: 16, image: '/images/category-detail/1_1_2.svg' },
    { id: 3, title: '야외 페스티벌 후기', users: 230, duration: '00:21', cuts: 9, image: '/images/category-detail/1_1_3.svg' },
    { id: 4, title: '생일 브이로그', users: 219, duration: '00:40', cuts: 12, image: '/images/category-detail/1_1_4.svg' },
    { id: 5, title: '볼펜꾸미기 DIY', users: 566, duration: '00:40', cuts: 12, image: '/images/category-detail/1_1_5.svg' },
    { id: 6, title: '휴일 혼자 놀기 브이로그', users: 345, duration: '00:40', cuts: 12, image: '/images/category-detail/1_1_6.svg' },
  ],
};

// 카테고리 아이콘 매핑
const categoryIcons = {
  daily: '/images/category-icons/01_life.png',
  travel: '/images/category-icons/02_trabel.png',
  fashion: '/images/category-icons/03_fashion.png',
  promotion: '/images/category-icons/04_marketing.png',
  food: '/images/category-icons/05_food.png',
  tips: '/images/category-icons/06_info.png',
  challenge: '/images/category-icons/07_challenge.png',
  fitness: '/images/category-icons/08_health.png',
};

function CategoryDetail({ category, onBack, onTabChange }) {
  const [activeFilter, setActiveFilter] = useState('recommend');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    logScreenView('category_detail', { category: category?.name });
  }, [category]);

  const templates = categoryTemplates[category?.id] || categoryTemplates.daily;

  const handleTemplateClick = (template) => {
    logButtonClick('category_detail', 'template', template.id);
    if (onTabChange) {
      onTabChange('templateDetail', { template });
    }
  };

  const handleBookmarkClick = (e, templateId) => {
    e.stopPropagation();
    logButtonClick('category_detail', 'bookmark', templateId);
    setBookmarkedIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    logButtonClick('category_detail', 'filter', filterId);
  };

  return (
    <div className="cd-container">
      {/* 헤더 */}
      <div className="cd-header">
        <button className="cd-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="cd-header-title">카테고리</span>
      </div>

      {/* 카테고리 타이틀 */}
      <div className="cd-category-title">
        <div className="cd-category-icon-wrapper">
          <img
            src={categoryIcons[category?.id] || categoryIcons.daily}
            alt={category?.name}
            className="cd-category-icon"
          />
        </div>
        <h2 className="cd-category-name">{category?.name || '일상기록'}</h2>
      </div>

      {/* 필터 탭 */}
      <div className="cd-filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            className={`cd-filter-tab ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => handleFilterClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 템플릿 그리드 */}
      <div className="cd-template-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            className="cd-template-card"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="cd-template-thumbnail">
              <img
                src={template.image}
                alt={template.title}
                className="cd-template-image"
              />
              {/* 북마크 버튼 */}
              <button
                className="cd-bookmark-btn"
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
              <div className="cd-users-badge">
                <img src="/images/meta-icons/03_pick.png" alt="users" width="12" height="12" />
                <span>{template.users}명</span>
              </div>
            </div>
            {/* 템플릿 정보 */}
            <div className="cd-template-info">
              <h4 className="cd-template-title">{template.title}</h4>
              <div className="cd-template-meta">
                <span className="cd-meta-item">
                  <img src="/images/meta-icons/02_media.png" alt="cuts" width="12" height="12" />
                  {template.cuts}컷
                </span>
                <span className="cd-meta-dot">·</span>
                <span className="cd-meta-item">
                  <img src="/images/meta-icons/01_time.png" alt="duration" width="12" height="12" />
                  {template.duration}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryDetail;
