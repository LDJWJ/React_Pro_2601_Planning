import './ContentPlan.css';

function ContentPlan({ cutNumber, duration, point, description }) {
  return (
    <div className="se-content-plan">
      <div className="se-content-plan-header">
        <span className="se-content-plan-label">콘텐츠 기획 📋 {cutNumber}</span>
        <span className="se-content-plan-duration">{duration}</span>
      </div>
      <div className="se-content-plan-card">
        <div className="se-plan-card-title">{cutNumber}번째 영상 포인트</div>
        {point && <div className="se-plan-card-point">{point}</div>}
        <div className="se-plan-card-description">{description}</div>
      </div>
    </div>
  );
}

export default ContentPlan;
