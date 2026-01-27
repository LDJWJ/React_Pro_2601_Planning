import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import EditorHeader from './EditorHeader';
import VideoPreview from './VideoPreview';
import Timeline from './Timeline';
import EditorNavBar from './EditorNavBar';
import ExportPreview from '../ExportPreview/ExportPreview';
import './VideoEditor.css';

function parseDuration(durationStr) {
  if (!durationStr) return 3;
  const match = durationStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 3;
}

function convertToTimeline(cuts) {
  const videoClips = [];
  const textClips = [];
  let currentStart = 0;

  cuts.forEach((cut, index) => {
    const duration = parseDuration(cut.duration);
    const startTime = currentStart;
    const endTime = currentStart + duration;

    videoClips.push({
      id: `video-${cut.id || index}`,
      startTime,
      endTime,
      videoUrl: cut.videoUrl || null,
      thumbnail: cut.thumbnail || null,
    });

    if (cut.subtitle) {
      textClips.push({
        id: `text-${cut.id || index}`,
        startTime,
        endTime,
        content: cut.subtitle,
      });
    }

    currentStart = endTime;
  });

  return {
    video: videoClips,
    text: textClips,
    bgm: null,
    voice: [],
    totalDuration: currentStart,
  };
}

function VideoEditor({ cuts, onBack }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('media');
  const [showExportPreview, setShowExportPreview] = useState(false);

  const videoRef = useRef(null);
  const playIntervalRef = useRef(null);

  // Convert cuts to timeline data (derived state)
  const timelineData = useMemo(() => {
    if (!cuts || cuts.length === 0) {
      return { video: [], text: [], bgm: null, voice: [], totalDuration: 0 };
    }
    return convertToTimeline(cuts);
  }, [cuts]);

  const tracks = useMemo(() => ({
    video: timelineData.video,
    text: timelineData.text,
    bgm: timelineData.bgm,
    voice: timelineData.voice,
  }), [timelineData]);

  const totalDuration = timelineData.totalDuration;

  // Find current video clip based on currentTime
  const getCurrentClip = useCallback(() => {
    return tracks.video.find(
      (clip) => currentTime >= clip.startTime && currentTime < clip.endTime
    ) || null;
  }, [tracks.video, currentTime]);

  // Find current subtitle based on currentTime
  const getCurrentSubtitle = useCallback(() => {
    const clip = tracks.text.find(
      (t) => currentTime >= t.startTime && currentTime < t.endTime
    );
    return clip ? clip.content : null;
  }, [tracks.text, currentTime]);

  const currentClip = getCurrentClip();
  const currentSubtitle = getCurrentSubtitle();

  // Sync video element with current clip and local time
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

  const handlePlayPause = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (videoRef.current && !isPlaying) {
      const clip = tracks.video.find(
        (c) => time >= c.startTime && time < c.endTime
      );
      if (clip && clip.videoUrl) {
        if (videoRef.current.src !== clip.videoUrl) {
          videoRef.current.src = clip.videoUrl;
          videoRef.current.load();
        }
        videoRef.current.currentTime = time - clip.startTime;
      }
    }
  };

  const handleExport = () => {
    setShowExportPreview(true);
  };

  const handleExportBack = () => {
    setShowExportPreview(false);
  };

  const handleExportGoHome = () => {
    onBack();
  };

  return (
    <div className="ve-container">
      {showExportPreview && (
        <ExportPreview
          cuts={cuts}
          onBack={handleExportBack}
          onGoHome={handleExportGoHome}
        />
      )}

      <EditorHeader
        onBack={onBack}
        onUndo={() => {}}
        onRedo={() => {}}
        canUndo={false}
        canRedo={false}
        onExport={handleExport}
      />

      <div className="ve-preview-area">
        <VideoPreview
          videoRef={videoRef}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          currentClip={currentClip}
          currentSubtitle={currentSubtitle}
          cutCount={cuts?.length || 0}
        />
      </div>

      <div className="ve-timeline-area">
        <Timeline
          currentTime={currentTime}
          totalDuration={totalDuration}
          tracks={tracks}
          onSeek={handleSeek}
        />
      </div>

      <div className="ve-nav-area">
        <EditorNavBar
          activeTab={activeNavTab}
          onTabChange={setActiveNavTab}
        />
      </div>
    </div>
  );
}

export default VideoEditor;
