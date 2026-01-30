// Netlify Function: AI 추천 컷 생성
// ChatGPT API를 서버사이드에서 호출하여 목적/주제 기반 6컷 스토리보드 추천

const FALLBACK_CUTS = {
  '브이로그': [
    { title: "오프닝", time: "2초" },
    { title: "장소 소개", time: "2초" },
    { title: "활동 장면", time: "1초" },
    { title: "디테일 컷", time: "2초" },
    { title: "리액션", time: "2초" },
    { title: "엔딩 인사", time: "1초" },
  ],
  '먹방': [
    { title: "음식 전체샷", time: "2초" },
    { title: "첫 입 리액션", time: "2초" },
    { title: "클로즈업", time: "1초" },
    { title: "먹는 장면", time: "2초" },
    { title: "사이드 메뉴", time: "2초" },
    { title: "마무리 한마디", time: "1초" },
  ],
  default: [
    { title: "인트로", time: "2초" },
    { title: "메인 장면 1", time: "2초" },
    { title: "전환 컷", time: "1초" },
    { title: "메인 장면 2", time: "2초" },
    { title: "하이라이트", time: "2초" },
    { title: "아웃트로", time: "1초" },
  ],
};

function getFallbackCuts(purpose, topics) {
  if (topics && topics.length > 0) {
    for (const topic of topics) {
      if (FALLBACK_CUTS[topic]) return FALLBACK_CUTS[topic];
    }
  }
  if (purpose && FALLBACK_CUTS[purpose]) return FALLBACK_CUTS[purpose];
  return FALLBACK_CUTS.default;
}

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { purpose, topics } = JSON.parse(event.body);

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // API 키 없으면 fallback 반환
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ cuts: getFallbackCuts(purpose, topics), fallback: true }),
      };
    }

    const topicsText = topics && topics.length > 0 ? topics.join(', ') : '일반';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 숏폼 영상 기획 전문가입니다.
사용자의 콘텐츠 목적과 주제를 기반으로 6컷짜리 영상 스토리보드를 추천하세요.
각 컷은 title(장면 이름, 10자 이내)과 time(초 단위, "1초" 또는 "2초")을 포함합니다.
총 시간은 10초가 되도록 구성하세요.
JSON 배열로만 응답하세요. 예: [{"title":"인트로","time":"2초"},...]`,
          },
          {
            role: 'user',
            content: `콘텐츠 목적: ${purpose || '일반'}
관심 주제: ${topicsText}

위 정보를 바탕으로 6컷짜리 숏폼 영상 스토리보드를 추천해주세요.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ cuts: getFallbackCuts(purpose, topics), fallback: true }),
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    let cuts;
    try {
      // JSON 블록 안에 있을 수 있으므로 추출 시도
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      cuts = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ cuts: getFallbackCuts(purpose, topics), fallback: true }),
      };
    }

    // 6컷이 아니면 보정
    if (!Array.isArray(cuts) || cuts.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ cuts: getFallbackCuts(purpose, topics), fallback: true }),
      };
    }

    // 6개로 맞추기
    while (cuts.length < 6) {
      cuts.push({ title: `컷 ${cuts.length + 1}`, time: "2초" });
    }
    cuts = cuts.slice(0, 6);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ cuts }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    };
  }
}
