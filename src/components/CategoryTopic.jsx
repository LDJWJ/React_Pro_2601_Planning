import { useState, useEffect } from 'react';
import './Category.css';
import { Button } from './common';
import { logScreenView, logButtonClick, logSelect } from '../utils/logger';

const topics = [
  {
    id: 'daily',
    image: '/images/onboarding/일상기록.svg',
    title: '일상기록',
    description: '브이로그, 육아, 반려동물, 일기',
  },
  {
    id: 'fitness',
    image: '/images/onboarding/execise.svg',
    title: '운동 · 건강',
    description: '홈트, 운동 루틴, 건강 관리, 다이어트',
  },
  {
    id: 'travel',
    image: '/images/onboarding/trip.svg',
    title: '여행',
    description: '국내/해외여행, 캠핑, 호캉스',
  },
  {
    id: 'fashion',
    image: '/images/onboarding/fashion.svg',
    title: '패션 · 뷰티',
    description: 'OOTD, 룩북, 메이크업, 뷰티',
  },
  {
    id: 'food',
    image: '/images/onboarding/eat.svg',
    title: '맛집 · 카페',
    description: '레시피, 맛집 탐방, 디저트, 카페 투어',
  },
  {
    id: 'promotion',
    image: '/images/onboarding/ad.svg',
    title: '홍보',
    description: '신상품 소개, 이벤트/할인, 브랜드 스토리',
  },
  {
    id: 'education',
    image: '/images/onboarding/education.svg',
    title: '정보 · 꿀팁',
    description: '1분 공부, 뉴스/핫이슈, 브리핑, 리뷰/리스트',
  },
  {
    id: 'challenge',
    image: '/images/onboarding/challenge.svg',
    title: '챌린지 · 틸',
    description: '챌린지 참여, 릴스/쇼츠, BPR, 틱톡 챌린지',
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

      <div className="category-content category-content-scrollable">
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
              className={`topic-card-img ${selected.includes(topic.id) ? 'selected' : ''}`}
              onClick={() => handleSelect(topic.id)}
            >
              <img
                className="topic-card-bg"
                src={topic.image}
                alt={topic.title}
              />
              <div className="topic-card-overlay" />
              <div className="topic-card-text">
                <span className="topic-title">{topic.title}</span>
                <span className="topic-description">{topic.description}</span>
              </div>
            </button>
          ))}
          {/* 잘 모르겠어요 - 동일 그리드 내 배치 */}
          <button
            className={`topic-card-img ${selected.includes('unknown') ? 'selected' : ''}`}
            onClick={() => handleSelect('unknown')}
          >
            <img
              className="topic-card-bg"
              src="/images/onboarding/search.svg"
              alt="잘 모르겠어요"
            />
            <div className="topic-card-overlay" />
            <div className="topic-card-text">
              <span className="topic-title">아직까지는</span>
              <span className="topic-description">잘 모르겠어요...</span>
            </div>
          </button>
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
