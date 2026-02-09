import './ContentPlan.css';
import { Chip } from '../common';

function ContentPlan({ cutNumber, duration, point, description }) {
  return (
    <div className="se-content-plan">
      <div className="se-content-plan-header">
        <span className="se-content-plan-label">콘텐츠 기획 📋 {cutNumber}</span>
      </div>
      <div className="se-content-plan-card">
        <div className="se-plan-badge">{cutNumber}</div>
        <div className="se-plan-body">
          <div className="se-plan-header-row">
            <span className="se-plan-title">{point || `${cutNumber}번째 영상 포인트`}</span>
            <Chip variant="time">{duration}</Chip>
          </div>
          <p className="se-plan-description">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default ContentPlan;
