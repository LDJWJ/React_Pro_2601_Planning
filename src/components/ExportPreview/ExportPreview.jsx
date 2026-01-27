import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import logoImg from '../../assets/logo.png';
import { logScreenView, logButtonClick } from '../../utils/logger';
import './ExportPreview.css';

function parseDuration(durationStr) {
  if (!durationStr) return 3;
  const match = durationStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 3;
}

function ExportPreview({ cuts, onBack, onGoHome }) {
  const [step, setStep] = useState('review'); // 'review' | 'settings' | 'loading' | 'complete'
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSheet, setShowSheet] = useState(false);
  const [settings, setSettings] = useState({
    platform: '유튜브 쇼츠',
    resolution: '1080p (권장)',
    format: 'MP4 (권장)',
    quality: '높음 (권장)',
  });

  const videoRef = useRef(null);
  const playIntervalRef = useRef(null);

  useEffect(() => {
    logScreenView('export_preview');
  }, []);

  const videoClips = useMemo(() => {
    if (!cuts || cuts.length === 0) return [];
    const clips = [];
    let currentStart = 0;
    cuts.forEach((cut, index) => {
      const duration = parseDuration(cut.duration);
      clips.push({
        id: `video-${cut.id || index}`,
        startTime: currentStart,
        endTime: currentStart + duration,
        videoUrl: cut.videoUrl || null,
        thumbnail: cut.thumbnail || null,
      });
      currentStart += duration;
    });
    return clips;
  }, [cuts]);

  const totalDuration = useMemo(() => {
    if (videoClips.length === 0) return 0;
    return videoClips[videoClips.length - 1].endTime;
  }, [videoClips]);

  const currentClip = useMemo(() => {
    return videoClips.find(
      (clip) => currentTime >= clip.startTime && currentTime < clip.endTime
    ) || videoClips[0] || null;
  }, [videoClips, currentTime]);

  const subtitleClips = useMemo(() => {
    if (!cuts || cuts.length === 0) return [];
    const clips = [];
    let currentStart = 0;
    cuts.forEach((cut, index) => {
      const duration = parseDuration(cut.duration);
      if (cut.subtitle) {
        clips.push({
          id: `sub-${cut.id || index}`,
          startTime: currentStart,
          endTime: currentStart + duration,
          content: cut.subtitle,
        });
      }
      currentStart += duration;
    });
    return clips;
  }, [cuts]);

  const currentSubtitle = useMemo(() => {
    const clip = subtitleClips.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    return clip ? clip.content : null;
  }, [subtitleClips, currentTime]);

  // Sync video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClip) return;

    if (video.src !== currentClip.videoUrl && currentClip.videoUrl) {
      video.src = currentClip.videoUrl;
      video.load();
    }

    const localTime = currentTime - currentClip.startTime;
    if (Math.abs(video.currentTime - localTime) > 0.3) {
      video.currentTime = localTime;
    }

    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [currentClip, currentTime, isPlaying]);

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [isPlaying, totalDuration]);

  const handlePlayPause = useCallback(() => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    logButtonClick('export_preview', isPlaying ? 'video_pause' : 'video_play');
    setIsPlaying((prev) => !prev);
  }, [currentTime, totalDuration, isPlaying]);

  const handleSettingChange = (key, value) => {
    logButtonClick('export_preview', 'setting_change', `${key}: ${value}`);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Open bottom sheet with animation
  const openSheet = () => {
    logButtonClick('export_preview', 'open_settings');
    setStep('settings');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShowSheet(true));
    });
  };

  // Close bottom sheet with animation
  const closeSheet = () => {
    logButtonClick('export_preview', 'close_settings');
    setShowSheet(false);
    setTimeout(() => setStep('review'), 300);
  };

  // Export → loading spinner (2s) → complete
  const handleExportStart = () => {
    const settingsValue = `${settings.platform}, ${settings.resolution}, ${settings.format}, ${settings.quality}`;
    logButtonClick('export_preview', 'export_start', settingsValue);
    setShowSheet(false);
    setStep('loading');
    setTimeout(() => {
      logButtonClick('export_preview', 'export_complete');
      setStep('complete');
    }, 2000);
  };

  const handleBack = () => {
    logButtonClick('export_preview', 'back');
    onBack();
  };

  const handleGoHome = () => {
    logButtonClick('export_preview', 'go_home');
    onGoHome();
  };

  const firstThumbnail = cuts?.[0]?.thumbnail || cuts?.[0]?.videoUrl || null;

  // --- Loading Step ---
  if (step === 'loading') {
    return (
      <div className="ep-container">
        <div className="ep-mobile-frame">
          <div className="ep-loading-screen">
            <div className="ep-spinner" />
            <p className="ep-loading-text">내보내기 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Complete Step ---
  if (step === 'complete') {
    return (
      <div className="ep-container">
        <div className="ep-mobile-frame">
          <div className="ep-complete-screen">
            <div className="ep-complete-content">
              <img src={logoImg} alt="HOOK" className="ep-complete-logo" />
              <div className="ep-complete-bell">&#x1F514;</div>
              <h2 className="ep-complete-title">내보내기가 완료되었어요!</h2>
              <p className="ep-complete-subtitle">갤러리 화면을 확인해주세요!</p>
            </div>
            <div className="ep-bottom-bar">
              <button className="ep-outline-btn" onClick={handleGoHome}>
                홈으로 이동하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Review / Settings Step ---
  return (
    <div className="ep-container">
      <div className="ep-mobile-frame">
        {/* Header */}
        <div className="ep-header">
          <button className="ep-header-back" onClick={handleBack}>
            &#8592;
          </button>
          <span className="ep-header-title">최종 검토 및 내보내기</span>
          <span className="ep-header-spacer" />
        </div>

        {/* Video preview */}
        <div className={`ep-preview-area${step === 'settings' ? ' ep-preview-dimmed' : ''}`}>
          <div className="ep-preview-frame">
            {currentClip?.videoUrl ? (
              <video
                ref={videoRef}
                className="ep-preview-video"
                src={currentClip.videoUrl}
                muted
                playsInline
              />
            ) : firstThumbnail ? (
              <img
                className="ep-preview-video"
                src={firstThumbnail}
                alt="미리보기"
              />
            ) : (
              <div className="ep-preview-placeholder">미리보기 없음</div>
            )}

            {currentSubtitle && (
              <div className="ep-subtitle-overlay">
                <span className="ep-subtitle-text">{currentSubtitle}</span>
              </div>
            )}

            {step === 'review' && (
              <button className="ep-play-overlay" onClick={handlePlayPause}>
                <span className="ep-play-icon">
                  {isPlaying ? '⏸' : '▶'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom CTA (review only) */}
        {step === 'review' && (
          <div className="ep-bottom-bar">
            <button className="ep-yellow-btn" onClick={openSheet}>
              내보내기 설정하기
            </button>
          </div>
        )}

        {/* Settings Bottom Sheet */}
        {step === 'settings' && (
          <div
            className={`ep-modal-overlay${showSheet ? ' ep-modal-overlay--visible' : ''}`}
            onClick={closeSheet}
          >
            <div
              className={`ep-modal-sheet${showSheet ? ' ep-modal-sheet--visible' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ep-modal-header">
                <span className="ep-modal-title">내보내기 설정</span>
                <button className="ep-modal-close" onClick={closeSheet}>
                  &#10005;
                </button>
              </div>

              <div className="ep-modal-body">
                <div className="ep-setting-row">
                  <span className="ep-setting-label">플랫폼</span>
                  <select
                    className="ep-setting-select"
                    value={settings.platform}
                    onChange={(e) => handleSettingChange('platform', e.target.value)}
                  >
                    <option value="유튜브 쇼츠">유튜브 쇼츠</option>
                    <option value="인스타 릴스">인스타 릴스</option>
                    <option value="틱톡">틱톡</option>
                  </select>
                </div>

                <div className="ep-setting-row">
                  <span className="ep-setting-label">해상도</span>
                  <select
                    className="ep-setting-select"
                    value={settings.resolution}
                    onChange={(e) => handleSettingChange('resolution', e.target.value)}
                  >
                    <option value="1080p (권장)">1080p (권장)</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </div>

                <div className="ep-setting-row">
                  <span className="ep-setting-label">포맷</span>
                  <select
                    className="ep-setting-select"
                    value={settings.format}
                    onChange={(e) => handleSettingChange('format', e.target.value)}
                  >
                    <option value="MP4 (권장)">MP4 (권장)</option>
                    <option value="MOV">MOV</option>
                    <option value="WebM">WebM</option>
                  </select>
                </div>

                <div className="ep-setting-row">
                  <span className="ep-setting-label">품질</span>
                  <select
                    className="ep-setting-select"
                    value={settings.quality}
                    onChange={(e) => handleSettingChange('quality', e.target.value)}
                  >
                    <option value="높음 (권장)">높음 (권장)</option>
                    <option value="중간">중간</option>
                    <option value="낮음">낮음</option>
                  </select>
                </div>
              </div>

              <div className="ep-modal-footer">
                <button className="ep-yellow-btn" onClick={handleExportStart}>
                  <span className="ep-export-icon">&#8595;</span>
                  내보내기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExportPreview;
