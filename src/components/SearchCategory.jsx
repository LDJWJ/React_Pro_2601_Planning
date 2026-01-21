import { useState, useEffect, useRef, useMemo } from 'react';
import './SearchCategory.css';
import { logScreenView, logButtonClick } from '../utils/logger';

// 정렬 옵션
const sortOptions = [
  { id: 'recommend', name: '추천', description: '맞춤 추천순' },
  { id: 'popular', name: '인기', description: '사용자 수 순' },
  { id: 'newest', name: '최신', description: '최근 등록순' },
  { id: 'trending', name: '트렌딩', description: '급상승 템플릿' },
];

// 카테고리 데이터
const categories = [
  { id: 'daily', name: '일상기록', emoji: '📅' },
  { id: 'travel', name: '여행', emoji: '✈️' },
  { id: 'fashion', name: '패션·뷰티', emoji: '🌸' },
  { id: 'promotion', name: '홍보', emoji: '🎁' },
  { id: 'fitness', name: '운동·건강', emoji: '⚽' },
  { id: 'tips', name: '정보·꿀팁', emoji: '📖' },
  { id: 'challenge', name: '챌린지·밈', emoji: '🍭' },
  { id: 'food', name: '맛집·카페', emoji: '🍎' },
];

// 임시 템플릿 데이터
const templates = [
  { id: 1, users: 300, duration: '18초', cuts: 6, thumbnail: '/videos/sample-1-thumb.png', videoUrl: '/videos/sample-1.mp4' },
  { id: 2, users: 300, duration: '18초', cuts: 6, thumbnail: '/videos/sample-2-thumb.png', videoUrl: '/videos/sample-2.mp4' },
  { id: 3, users: 300, duration: '18초', cuts: 6, thumbnail: 'https://picsum.photos/200/300?random=3' },
  { id: 4, users: 300, duration: '18초', cuts: 6, thumbnail: 'https://picsum.photos/200/300?random=4' },
  { id: 5, users: 300, duration: '18초', cuts: 6, thumbnail: 'https://picsum.photos/200/300?random=5' },
  { id: 6, users: 300, duration: '18초', cuts: 6, thumbnail: 'https://picsum.photos/200/300?random=6' },
];

function SearchCategory({ onTabChange }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('추천');
  const dropdownRef = useRef(null);

  useEffect(() => {
    logScreenView('search_category');
  }, []);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [filterOpen]);

  // Sort templates based on selected option
  const sortedTemplates = useMemo(() => {
    const templatesCopy = [...templates];

    switch (sortBy) {
      case '인기':
        // Sort by users count (descending)
        return templatesCopy.sort((a, b) => b.users - a.users);
      case '최신':
        // Sort by id (descending, assuming higher id = newer)
        return templatesCopy.sort((a, b) => b.id - a.id);
      case '트렌딩':
        // Shuffle for demo (in production, would use trending algorithm)
        return templatesCopy.sort(() => Math.random() - 0.5);
      case '추천':
      default:
        // Keep original order for recommended
        return templatesCopy;
    }
  }, [sortBy]);

  const handleSearch = () => {
    logButtonClick('search_category', 'search_bar');
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    logButtonClick('search_category', 'category', category.name);
  };

  const handleTemplateClick = (template) => {
    logButtonClick('search_category', 'template', template.id);
    if (onTabChange) {
      onTabChange('templateDetail', { template });
    }
  };

  const handleLikeClick = (e, templateId) => {
    e.stopPropagation();
    logButtonClick('search_category', 'like', templateId);
  };

  const handleFilterClick = () => {
    setFilterOpen(!filterOpen);
    logButtonClick('search_category', 'filter_toggle');
  };

  const handleSortSelect = (option) => {
    setSortBy(option.name);
    setFilterOpen(false);
    logButtonClick('search_category', 'sort_option', option.id);
  };

  return (
    <div className="search-category-container">
      {/* 검색창 */}
      <div className="search-section">
        <div className="search-bar" onClick={handleSearch}>
          <span className="search-icon">🔍</span>
          <span className="search-placeholder">원하는 템플릿을 검색해보세요</span>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            <span className="category-emoji">{category.emoji}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* 필터 영역 */}
      <div className="filter-section" ref={dropdownRef}>
        <button className="filter-button" onClick={handleFilterClick}>
          {sortBy}
          <span className={`filter-arrow ${filterOpen ? 'open' : ''}`}>▼</span>
        </button>
        {filterOpen && (
          <div className="filter-dropdown">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                className={`filter-option ${sortBy === option.name ? 'selected' : ''}`}
                onClick={() => handleSortSelect(option)}
              >
                <span className="option-name">{option.name}</span>
                <span className="option-description">{option.description}</span>
                {sortBy === option.name && (
                  <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 템플릿 그리드 */}
      <div className="template-grid-search">
        {sortedTemplates.map((template) => (
          <div
            key={template.id}
            className="template-card-search"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="template-thumbnail-search">
              <img
                src={template.thumbnail}
                alt="템플릿"
                className="thumbnail-image"
              />
              {/* 사용자 수 뱃지 */}
              <div className="users-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span>{template.users}</span>
              </div>
              {/* 좋아요 버튼 */}
              <button
                className="like-button"
                onClick={(e) => handleLikeClick(e, template.id)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              {/* 하단 정보 */}
              <div className="template-info">
                <span className="template-duration">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {template.duration}
                </span>
                <span className="template-cuts">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  </svg>
                  {template.cuts}컷
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchCategory;
