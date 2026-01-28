import { useState, useEffect } from 'react';
import './Category.css';
import { Button } from './common';
import { logScreenView, logButtonClick, logSelect } from '../utils/logger';

const topics = [
  {
    id: 'daily',
    icon: '📅',
    title: '일상기록',
    description: '브이로그, 육아, 반려동물, 일기/기록',
  },
  {
    id: 'promotion',
    icon: '🎁',
    title: '홍보',
    description: '신상품 소개, 이벤트/할인, 브랜드 스토리',
  },
  {
    id: 'travel',
    icon: '✈️',
    title: '여행',
    description: '국내/해외여행, 캠핑, 호캉스, 여행 꿀팁',
  },
  {
    id: 'fashion',
    icon: '🌸',
    title: '패션 · 뷰티',
    description: '코디(OOTD), 룩북, 헤어스타일, 메이크업, 제품 소개',
  },
  {
    id: 'food',
    icon: '🍎',
    title: '맛집 · 카페',
    description: '레시피, 맛집 탐방, 카페 투어, 디저트',
  },
  {
    id: 'fitness',
    icon: '⚽',
    title: '운동 · 건강',
    description: '홈트, 운동 루틴, 건강 관리, 다이어트',
  },
];

function CategoryTopic({ onNext, onBack }) {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    logScreenView('category_topic');
  }, []);

  const handleSelect = (id) => {
    setSelected((prev) => {
      const newSelected = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      logSelect('category_topic', 'topic_card', newSelected);
      return newSelected;
    });
  };

  const handleNext = () => {
    if (selected.length > 0) {
      logButtonClick('category_topic', 'next_button', selected.join(', '));
      onNext(selected);
    }
  };

  return (
    <div className="category-container">
      <div className="category-progress-bar">
        <div className="category-progress-segment active" />
        <div className="category-progress-segment active" />
        <div className="category-progress-segment" />
      </div>

      <div className="category-content">
        <div className="category-header">
          <h1 className="category-title">
            어떤 주제의
            <br />
            영상을 만들고 싶으신가요?
          </h1>
          <p className="category-subtitle">여러가지의 종류를 골라도 괜찮아요</p>
        </div>

        <div className="topic-grid">
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={`topic-card ${selected.includes(topic.id) ? 'selected' : ''}`}
              onClick={() => handleSelect(topic.id)}
            >
              <span className="topic-icon">{topic.icon}</span>
              <span className="topic-title">{topic.title}</span>
              <span className="topic-description">{topic.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="category-footer">
        <Button variant="primary" fullWidth onClick={handleNext} disabled={selected.length === 0}>
          다음
        </Button>
      </div>
    </div>
  );
}

export default CategoryTopic;
