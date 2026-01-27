// Google Apps Script 웹 앱 URL
// 개발 환경에서는 Vite 프록시를 사용하여 COEP 문제 회피
const SCRIPT_URL = import.meta.env.DEV
  ? '/api/log'
  : (import.meta.env.VITE_GOOGLE_SCRIPT_URL || '');

// 세션 ID 생성 (브라우저 세션 동안 유지)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// 로그 전송 함수
export const sendLog = async (logData) => {
  if (!SCRIPT_URL) {
    console.log('[Logger] URL not configured:', logData);
    return;
  }

  try {
    const payload = {
      userId: getSessionId(),
      userAgent: navigator.userAgent,
      ...logData,
    };

    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    // 프로덕션에서는 no-cors 모드 사용 (Google Apps Script 직접 호출)
    if (!import.meta.env.DEV) {
      fetchOptions.mode = 'no-cors';
    }

    await fetch(SCRIPT_URL, fetchOptions);
  } catch (error) {
    console.error('[Logger] Failed to send log:', error);
  }
};

// 화면 진입 로그
export const logScreenView = (screenName) => {
  sendLog({
    screen: screenName,
    event: 'screen_view',
    target: '',
    value: '',
  });
};

// 버튼 클릭 로그
export const logButtonClick = (screenName, buttonName, value = '') => {
  sendLog({
    screen: screenName,
    event: 'button_click',
    target: buttonName,
    value: value,
  });
};

// 선택 이벤트 로그
export const logSelect = (screenName, itemName, value) => {
  sendLog({
    screen: screenName,
    event: 'select',
    target: itemName,
    value: Array.isArray(value) ? value.join(', ') : value,
  });
};

// 로그인 이벤트 로그
export const logLogin = (method, userEmail = '') => {
  sendLog({
    screen: 'login',
    event: 'login',
    target: method,
    value: userEmail,
  });
};

// 스크롤 이벤트 로그 (디바운스 포함)
export const logScroll = (screenName, scrollPercent) => {
  sendLog({
    screen: screenName,
    event: 'scroll',
    target: 'scroll',
    value: `${Math.round(scrollPercent)}%`,
  });
};

export default {
  sendLog,
  logScreenView,
  logButtonClick,
  logSelect,
  logLogin,
  logScroll,
};
