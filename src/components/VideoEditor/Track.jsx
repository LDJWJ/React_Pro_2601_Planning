import './Track.css';

function Track({ type, icon, items, totalDuration, pps, showAddButton }) {
  const renderClip = (item) => {
    const left = item.startTime * pps;
    const width = Math.max((item.endTime - item.startTime) * pps, 4);

    switch (type) {
      case 'text':
        return (
          <div
            key={item.id}
            className="ve-track-clip ve-track-clip--text"
            style={{ left: `${left}px`, width: `${width}px` }}
          >
            <span className="ve-track-clip-text">{item.content || 'Label'}</span>
          </div>
        );
      case 'bgm':
        return (
          <div
            key={item.id}
            className="ve-track-clip ve-track-clip--bgm"
            style={{ left: `${left}px`, width: `${width}px` }}
          >
            <span className="ve-track-clip-text">{item.label || 'Label'}</span>
          </div>
        );
      case 'video':
        return (
          <div
            key={item.id}
            className="ve-track-clip ve-track-clip--video"
            style={{ left: `${left}px`, width: `${width}px` }}
          >
            {item.thumbnail ? (
              <img
                className="ve-track-clip-thumbnail"
                src={item.thumbnail}
                alt=""
              />
            ) : (
              <div className="ve-track-clip-thumbnail-placeholder" />
            )}
          </div>
        );
      case 'voice':
        return (
          <div
            key={item.id}
            className="ve-track-clip ve-track-clip--voice"
            style={{ left: `${left}px`, width: `${width}px` }}
          >
            <span className="ve-track-clip-text">{item.label || 'Label'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ve-track">
      <div className="ve-track-label">
        <img src={icon} alt="" className="ve-track-icon" />
        {showAddButton && (
          <button className="ve-track-add-btn" title="추가">+</button>
        )}
      </div>
      <div className="ve-track-content" style={{ width: `${totalDuration * pps}px` }}>
        {items.map(renderClip)}
      </div>
    </div>
  );
}

export default Track;
