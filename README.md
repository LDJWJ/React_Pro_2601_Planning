# HookHook - 숏폼 영상 편집 앱

모바일 숏폼 영상 제작을 위한 React 기반 웹 애플리케이션 프로토타입입니다.

## 기술 스택

- **React** 19.2.0
- **Vite** 7.2.4
- **Google OAuth** (@react-oauth/google)
- **FFmpeg.wasm** (@ffmpeg/ffmpeg)
- **IndexedDB** (브라우저 내장 — 영상 Blob 영속 저장)

## 주요 기능

### 1. 로그인 화면 (`LoginScreen`)
- Google 소셜 로그인 (구현 완료)
- 네이버 로그인 (UI만 구현)
- Apple 로그인 (UI만 구현)

### 2. 온보딩 플로우
사용자 맞춤 템플릿 추천을 위한 3단계 온보딩:

**목적 선택 (`CategoryPurpose`)**
- 가게/브랜드 소개
- 제품/메뉴 홍보
- 일상/경험 공유
- 리뷰/정보 전달

**주제 선택 (`CategoryTopic`)** - 복수 선택 가능
- 일상기록, 홍보, 여행
- 패션·뷰티, 맛집·카페, 운동·건강

**플랫폼 선택 (`CategoryPlatform`)** - 복수 선택 가능
- 인스타그램 릴스, 유튜브 쇼츠, 틱톡
- 네이버 클립, 카카오톡 지금

### 3. 홈 화면 (`Home`)
- 검색 바
- **3D 캐러셀**: 사용자 맞춤 추천 템플릿 표시
- 주말 추천 템플릿 그리드
- 하단 네비게이션 (템플릿, 편집기, 마이페이지)

### 4. 템플릿 탐색 (`SearchCategory`)
- 카테고리별 필터 (일상기록, 여행, 패션·뷰티 등)
- 2열 그리드 템플릿 목록
- 좋아요 버튼, 사용자 수/재생시간/컷 수 표시
- 템플릿 클릭 시 상세 화면으로 이동

### 5. 템플릿 상세 (`TemplateDetail`)
- 영상 미리보기 (자동재생, 탭으로 재생/일시정지)
- 우측 플로팅 정보 (재생시간, 컷 수, 사용자 수, 좋아요)
- 해시태그 표시
- "편집 시작하기" CTA 버튼 → StoryEdit 화면으로 이동
- 메뉴 아이콘 → StoryPlanning 화면으로 이동
- 저장/북마크 버튼

### 6. 스토리 편집 (`StoryEdit`)
기존 스토리 기획 + 콘텐츠 업로드를 하나로 통합한 화면:
- **영상 미리보기**: 검정 배경, 중앙 폰 프레임 내 영상/플레이스홀더
- **컷 탭 바** (`CutTabBar`):
  - 가로 스크롤 탭 (60x60px, border-radius 8px)
  - 완료 컷: 썸네일 이미지 표시
  - 현재 편집 컷: "+" 아이콘, 연핑크 배경 (#FFE4E6)
  - 대기 컷: 회색 배경, 길이 표시
  - 하단 진행 바 (#3B82F6)
- **콘텐츠 기획** (`ContentPlan`): 컷별 읽기 전용 정보 카드 (영상 포인트, 콘티 설명)
- **자막 섹션** (`SubtitleSection`):
  - 자막 입력 필드
  - AI 자막 추천 버튼 (검정 배경, 흰색 텍스트)
  - Netlify Functions 엔드포인트 호출 (`/.netlify/functions/generate-subtitle`)
  - 키워드 기반 폴백 자막 지원 (food/mood/person/default)
  - AI 추천 결과 칩 리스트
- **컷별 영상 업로드**: 파일 선택 → ObjectURL + Canvas 썸네일 생성
- **IndexedDB 영속 저장** (`storyEditDB.js`):
  - 영상 업로드 즉시 IndexedDB에 Blob 저장 (이탈 시 데이터 보호)
  - 화면 재진입 시 저장된 컷 데이터 자동 복원 (영상, 썸네일, 자막, 진행 상태)
  - 유저별 + 템플릿별 격리 키 (`userId_templateId_cutId`)
  - 세션 메타 정보 저장 (현재 편집 중인 컷 인덱스, 저장 시각)
  - 전체 삭제 API (`deleteAllCuts`)
- **저장하기**: IndexedDB 전체 저장 + 토스트 메시지
- **완성하기**: 전체 저장 후 Editor로 이동

### 7. 스토리 기획 (`StoryPlanningScreen`) — 레거시
- 상단 고정 영상 프리뷰 (선택된 컷 타임스탬프 재생)
- 세그먼트 프로그레스 바 (컷별 진행 표시, 탭으로 컷 이동, 컷 time 기반 동적 비율)
- 컷별 메모 입력 기능
- **AI 추천 컷 생성**: 헤더 우측 "AI 추천" 버튼
  - 온보딩에서 선택한 목적(purpose)/주제(topics) 기반 6컷 스토리보드 자동 생성
  - Netlify Functions 엔드포인트 호출 (`/.netlify/functions/generate-cuts`)
  - OpenAI `gpt-4o-mini` 모델로 숏폼 영상 기획 전문가 프롬프트 사용
  - API 실패 시 카테고리별 fallback 데이터 자동 적용 (브이로그/먹방/default)
  - 로딩 중 "추천 중..." 상태 표시, 결과 수신 시 컷 리스트 교체
- 하단 취소/저장 버튼
- TemplateDetail 메뉴 아이콘에서 진입 가능

### 8. 영상 편집기 (`Editor`) — 레거시
- **미디어 추가**: 영상/이미지 업로드
- **텍스트 오버레이**: 드래그 가능, 시간 범위 설정, 크기 조절
- **자막 추가**: 시작/종료 시간 지정
- **BGM 추가**: 배경 음악 선택
- **음성 녹음**: MediaRecorder API 활용
- **타임라인**: 미디어, 자막, 음악, 음성 트랙 시각화
- **재생 컨트롤**: 재생/일시정지, 시간 탐색
- **내보내기**: 두 가지 방식 지원
  - Canvas Export (WebM): 실시간 캔버스 렌더링으로 텍스트 오버레이 포함
  - FFmpeg Export (MP4): @ffmpeg/ffmpeg WASM 활용 인코딩

### 9. 영상 편집 화면 (`VideoEditor`)
StoryEdit에서 완성한 컷 데이터(영상, 자막, 썸네일)를 받아 타임라인 기반 영상 편집 UI를 제공:
- **EditorHeader**: 뒤로가기 + "새 프로젝트", Undo/Redo, 주황색 "내보내기" 버튼
- **VideoPreview**: 9:16 비율 검정 프레임, 영상 재생, 자막 오버레이 (노란색 bold, text-shadow), 재생 컨트롤바 (▶재생, 시간 표시, 컷 수)
- **Timeline**: 시간 눈금 (적응형 간격), 노란색 플레이헤드 (세로선 + 삼각형), 클릭→시간 이동, 가로 스크롤
- **Track**: 4개 트랙 행 — voice(🎤), text(Aa), bgm(🎵), video(🎬)
  - 텍스트 클립: 노란 배경 + 자막 텍스트
  - BGM 클립: 연노란 배경
  - 영상 클립: 썸네일 이미지
  - 음성 클립: 녹색 배경
- **EditorNavBar**: 하단 5탭 네비게이션 — 미디어(📁), 필터(✨), BGM(🎵), TTS/음성(🎤), 자막(Aa)
- **재생 로직**: 100ms 인터벌로 currentTime 증가, 해당 클립의 videoRef.src 자동 설정
- **convertToTimeline**: cuts 배열 → video/text 트랙 + totalDuration 자동 계산
- **ExportPreview 연동**: 내보내기 버튼 → ExportPreview 컴포넌트 표시

## 프로젝트 구조

```
public/
├── videos/
│   ├── sample-1.mp4       # 샘플 비디오 1
│   ├── sample-1-thumb.png # 썸네일 1
│   ├── sample-2.mp4       # 샘플 비디오 2
│   └── sample-2-thumb.png # 썸네일 2
└── vite.svg
src/
├── App.jsx                 # 메인 앱 (화면 라우팅)
├── App.css
├── main.jsx               # 엔트리 포인트
├── index.css
├── styles/
│   └── design-tokens.css  # 디자인 토큰 (Primitive + Semantic 컬러 변수)
├── assets/
│   └── logo.png           # 앱 로고
├── components/
│   ├── LoginScreen.jsx        # 로그인 화면
│   ├── LoginScreen.css
│   ├── CategoryPurpose.jsx    # 목적 선택
│   ├── CategoryTopic.jsx      # 주제 선택
│   ├── CategoryPlatform.jsx   # 플랫폼 선택
│   ├── Category.css
│   ├── Home.jsx               # 홈 화면
│   ├── Home.css
│   ├── SearchCategory.jsx     # 템플릿 탐색
│   ├── SearchCategory.css
│   ├── TemplateDetail.jsx     # 템플릿 상세
│   ├── TemplateDetail.css
│   ├── StoryPlanningScreen.jsx # 스토리 기획 (레거시)
│   ├── StoryPlanningScreen.css
│   ├── ContentUploadScreen.jsx # 콘텐츠 업로드 (레거시)
│   ├── ContentUploadScreen.css
│   ├── StoryEdit/             # 스토리 편집 (통합)
│   │   ├── StoryEdit.jsx      # 메인 컨테이너 (상태관리, IndexedDB 연동)
│   │   ├── StoryEdit.css
│   │   ├── CutTabBar.jsx      # 컷 탭 바
│   │   ├── CutTabBar.css
│   │   ├── ContentPlan.jsx    # 콘텐츠 기획 카드
│   │   ├── ContentPlan.css
│   │   ├── SubtitleSection.jsx # 자막 섹션
│   │   └── SubtitleSection.css
│   ├── VideoEditor/              # 영상 편집 화면 (타임라인 기반)
│   │   ├── VideoEditor.jsx       # 메인 컨테이너 (상태관리, convertToTimeline, 재생 로직)
│   │   ├── VideoEditor.css
│   │   ├── EditorHeader.jsx      # 헤더 (뒤로가기, Undo/Redo, 내보내기)
│   │   ├── EditorHeader.css
│   │   ├── VideoPreview.jsx      # 영상 프레임 + 자막 오버레이 + 재생 컨트롤
│   │   ├── VideoPreview.css
│   │   ├── Timeline.jsx          # 시간 눈금 + 플레이헤드 + 트랙 컨테이너
│   │   ├── Timeline.css
│   │   ├── Track.jsx             # 개별 트랙 행 (voice/text/bgm/video)
│   │   ├── Track.css
│   │   ├── EditorNavBar.jsx      # 하단 5탭 네비게이션
│   │   └── EditorNavBar.css
│   ├── common/                  # 공통 UI 컴포넌트 (디자인 시스템)
│   │   ├── index.js             # barrel export
│   │   ├── Button.jsx           # Button 컴포넌트 (Primary/Secondary/Tertiary)
│   │   ├── Button.css
│   │   ├── IconButton.jsx       # IconButton 컴포넌트 (transparent/background)
│   │   └── IconButton.css
│   ├── BottomNavigation.jsx   # 하단 네비게이션
│   ├── BottomNavigation.css
│   ├── Editor.jsx             # 영상 편집기 (레거시)
│   └── Editor.css
└── utils/
    ├── logger.js          # 로깅 유틸리티
    └── storyEditDB.js     # IndexedDB CRUD (컷 저장/로드/삭제)
netlify/
└── functions/
    ├── generate-subtitle.js  # AI 자막 추천 (OpenAI gpt-4o-mini)
    └── generate-cuts.js      # AI 추천 컷 생성 (OpenAI gpt-4o-mini)
```

## 환경 변수 설정

루트 디렉토리에 `.env` 파일 생성 (`.env.example` 참조):

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_SCRIPT_URL=your_google_apps_script_url
OPENAI_API_KEY=your_openai_api_key
```

| 변수 | 설명 |
|------|------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `VITE_GOOGLE_SCRIPT_URL` | Google Apps Script 엔드포인트 (분석 로깅용) |
| `OPENAI_API_KEY` | OpenAI API 키 (Netlify Functions 서버사이드, AI 자막/컷 추천용) |

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 5173)
npm run dev

# ESLint 실행
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 화면 흐름

```
로그인 → 목적 선택 → 주제 선택 → 플랫폼 선택 → 홈
                                              ↓
                                    ┌─────────┴─────────┐
                                    ↓                   ↓
                              템플릿 탐색          편집기(레거시)
                                    ↓
                              템플릿 상세
                               ↓         ↓
                     스토리 편집      스토리 기획
                     (StoryEdit)   (레거시)
                          ↓
                    영상 편집 화면
                    (VideoEditor)
                          ↓
                     내보내기 미리보기
                    (ExportPreview)
                          ↓
                          홈
```

### 데이터 흐름 (StoryEdit)
```
영상 업로드 → ObjectURL 생성 + Canvas 썸네일
           → IndexedDB 즉시 저장 (saveCut)
           → 컷 탭 바 썸네일 반영

저장하기   → IndexedDB 전체 저장 (saveAllCuts)
           → 토스트 메시지 표시

재진입     → IndexedDB 로드 (loadAllCuts)
           → Blob → ObjectURL 복원
           → 컷 상태 + 자막 + 진행 위치 복원

완성하기   → IndexedDB 저장 → VideoEditor 이동

VideoEditor → convertToTimeline(cuts)
           → tracks.video: [{id, startTime, endTime, videoUrl, thumbnail}]
           → tracks.text: [{id, startTime, endTime, content}]
           → 재생: currentTime → getCurrentClip → videoRef.src 설정
           → 내보내기 → ExportPreview → 홈 복귀
```

---

## 디자인 시스템

`src/styles/design-tokens.css`에서 2계층 CSS 변수 구조로 컬러를 중앙 관리합니다.

### Primitive 토큰 (원시 팔레트)
| 계열 | 토큰 |
|------|------|
| Black/White | `--black`, `--white` |
| Gray | `--gray-50` ~ `--gray-950` (9단계) |
| Yellow | `--yellow-50` ~ `--yellow-900` (7단계) |
| Orange | `--orange-100` ~ `--orange-800` (4단계) |
| Red | `--red-50` ~ `--red-800` (5단계) |

### Semantic 토큰 (역할 기반)
| 카테고리 | 주요 토큰 | 용도 |
|----------|----------|------|
| Fill | `--fill-primary` (#F8FF33), `--fill-secondary` (#FF721A) | 버튼, CTA |
| Text | `--text-primary` (#FFF), `--text-secondary` (#999), `--text-accent` (#F8FF33) | 텍스트 |
| Background | `--bg-surface` (#000), `--bg-secondary` (#1A1A1A), `--bg-tertiary` (#333) | 배경 |
| Line | `--line-primary` (#333), `--line-accent` (#F8FF33) | 테두리, 구분선 |
| Navigation | `--nav-icon-default` (#999), `--nav-icon-active` (#F8FF33) | 하단 네비게이션 |
| Editor | `--editor-playhead` (#F8FF33), `--editor-export-btn` (#FF721A) | 편집기 전용 |
| StoryEdit | `--se-accent` (#F8FF33), `--se-tab-current-bg` (#FEFFDD) | 스토리 편집 전용 |
| Button | `--btn-height-lg` (48px), `--btn-radius-lg` (12px), `--btn-disabled-bg` (#333) | 공통 버튼 |

### 공통 컴포넌트 (`src/components/common/`)

디자인 시스템 기반 재사용 가능한 UI 컴포넌트:

**Button** — 3가지 variant × 2가지 size + disabled 상태
| Variant | 배경 | 텍스트 | Border |
|---------|------|--------|--------|
| `primary` | 노란색 (`--fill-primary`) | 검정 (`--text-on-primary`) | 없음 |
| `secondary` | 다크 (`--bg-secondary`) | 흰색 (`--text-primary`) | 1px `--line-primary` |
| `tertiary` | 투명 | 노란색 (`--fill-primary`) | 2px `--fill-primary` |

```jsx
import { Button } from '../common';
<Button variant="primary" size="large" fullWidth>다음</Button>
<Button variant="secondary" size="small" iconLeft={<Icon />}>취소</Button>
<Button variant="tertiary" disabled>홈으로</Button>
```

**IconButton** — 2가지 variant + selected 상태
| Variant | 기본 | Selected |
|---------|------|----------|
| `transparent` | 배경 없음, gray-400 텍스트 | 흰색 텍스트 |
| `background` | gray-700 배경, 투명 border | 노란색 border + 텍스트 |

```jsx
import { IconButton } from '../common';
<IconButton variant="background" selected icon={<Icon />} label="편집" />
```

### 적용 범위
- 22개 CSS 파일의 하드코딩된 컬러를 CSS 변수로 교체
- 플랫폼 브랜드 컬러(YouTube, Instagram, Naver, Kakao, TikTok)는 원본 유지
- `rgba()` 반투명 오버레이는 원본 유지

---

## 버전 히스토리

### v1.23.0 (2026-01-30)
**AI 추천 컷 생성 기능 — 스토리 기획 화면**

온보딩에서 선택한 목적(purpose)/주제(topics)를 기반으로 AI가 6컷 스토리보드를 자동 생성하는 기능 추가. 스토리 기획 화면 헤더에 "AI 추천" 버튼 배치.

주요 변경:
- **generate-cuts.js** Netlify Function 신규 생성 — `gpt-4o-mini` 모델로 숏폼 영상 기획 전문가 프롬프트 사용
  - purpose + topics를 전달하여 6컷(title, time) 추천 요청
  - JSON 응답 파싱 (코드블록 내 배열 추출 지원)
  - 6컷 미만 시 보정, 6컷 초과 시 슬라이스
  - API 키 미설정 / API 실패 / JSON 파싱 실패 시 카테고리별 fallback 반환 (브이로그/먹방/default)
- **StoryPlanningScreen.jsx** — `selections` prop 수신, `aiCuts` / `aiLoading` state 추가
  - "AI 추천" 버튼 클릭 → Netlify Function 호출 → 컷 리스트 교체
  - 로딩 중 "추천 중..." 표시 + disabled 처리
  - AI 결과 수신 시 id/startTime 자동 계산, 메모 초기화
- **프로그레스 바 동적화** — 고정 `[2,2,1,2,2,1]` → `cuts.map(cut => parseInt(cut.time))` 동적 계산
- **App.jsx** — `StoryPlanningScreen`에 `selections` prop 전달 추가
- **StoryPlanningScreen.css** — AI 추천 버튼 스타일 (그라데이션 pill 버튼, disabled/active 상태)

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 생성 | `netlify/functions/generate-cuts.js` | AI 추천 컷 생성 Netlify Function (gpt-4o-mini, fallback 포함) |
| 수정 | `src/App.jsx` | StoryPlanningScreen에 selections prop 전달 |
| 수정 | `src/components/StoryPlanningScreen.jsx` | AI 추천 버튼, aiCuts/aiLoading state, 동적 프로그레스 바 |
| 수정 | `src/components/StoryPlanningScreen.css` | AI 추천 버튼 스타일 (header-row, pill 버튼) |

---

### v1.22.0 (2026-01-28)
**공통 Button / IconButton 컴포넌트 추가 — 디자인 시스템 Buttons 스펙 구현**

디자인 시스템 Buttons.jpg 스펙 기반으로 공통 Button 및 IconButton 컴포넌트를 신규 생성. 기존 화면에는 영향 없이 새 파일만 추가.

주요 변경:
- **Button 컴포넌트** — `variant` (primary/secondary/tertiary) × `size` (large/small) × `disabled` 조합 지원
  - Primary: 노란 배경 + 검정 텍스트, hover 시 `--fill-primary-hover`
  - Secondary: 다크 배경 + 흰 텍스트 + border, hover 시 `--bg-tertiary`
  - Tertiary: 투명 + 노란 border + 노란 텍스트, hover 시 반투명 노란 배경
  - `iconLeft` / `iconRight` 아이콘 슬롯, `fullWidth` 전체 너비 옵션
- **IconButton 컴포넌트** — `variant` (transparent/background) × `selected` 상태 지원
  - Transparent: 배경 없음, selected 시 흰색 텍스트
  - Background: gray-700 배경, selected 시 노란 border + 노란 텍스트
  - `icon` + 선택적 `label` 지원
- **design-tokens.css** — `/* Button */` 토큰 섹션 추가 (radius, height, gap, disabled 컬러)
- **BEM 네이밍** — `hh-btn`, `hh-icon-btn` 접두사로 기존 스타일과 충돌 방지
- **barrel export** — `import { Button, IconButton } from '../common'`

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 생성 | `src/components/common/Button.jsx` | Button 컴포넌트 (variant/size/disabled/icon/fullWidth) |
| 생성 | `src/components/common/Button.css` | BEM 스타일 (Primary/Secondary/Tertiary × Large/Small × hover/active/disabled) |
| 생성 | `src/components/common/IconButton.jsx` | IconButton 컴포넌트 (variant/selected/icon/label) |
| 생성 | `src/components/common/IconButton.css` | BEM 스타일 (transparent/background × selected) |
| 생성 | `src/components/common/index.js` | barrel export (Button, IconButton) |
| 수정 | `src/styles/design-tokens.css` | `/* Button */` 토큰 섹션 추가 |

---

### v1.21.0 (2026-01-28)
**디자인 시스템 컬러 토큰 전체 적용**

`src/styles/design-tokens.css`에 Primitive(원시 팔레트) + Semantic(역할 기반) 2계층 CSS 변수를 정의하고, 22개 CSS 파일의 하드코딩된 컬러 값을 모두 CSS 변수로 교체.

주요 변경:
- **design-tokens.css 신규 생성** — Primitive(Gray/Yellow/Orange/Red) + Semantic(Fill/Text/BG/Line/Nav/Editor/StoryEdit) 토큰 정의
- **브랜드 액센트 통일** — `#FAFF5E`, `#FAEC23`, `#FFD700` 등 유사 노란색 → `#F8FF33` (`--fill-primary`)로 통일
- **비표준 그레이 표준화** — `#1C1C1E`, `#2C2C2E`, `#444`, `#888` 등 → 디자인 시스템 Gray Scale로 매핑
- **비디자인 시스템 컬러 교체** — `#3B82F6`(파랑) → Yellow Primary, `#81C784`(초록) → Orange/300, `#ff4d6d`(핑크) → Red/500
- **플랫폼 브랜드 컬러 유지** — YouTube `#FF0000`, Instagram/Naver 그라데이션, Kakao `#FEE500` 등

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 생성 | `src/styles/design-tokens.css` | 2계층 CSS 변수 정의 (Primitive + Semantic) |
| 수정 | `src/index.css` | `@import './styles/design-tokens.css'` 추가 + 하드코딩 컬러 교체 |
| 수정 | `src/App.css` | 하드코딩 컬러 → CSS 변수 교체 |
| 수정 | `src/components/LoginScreen.css` | 라이트 테마 그레이 → CSS 변수 |
| 수정 | `src/components/Category.css` | 브랜드 컬러 유지, 나머지 → CSS 변수 |
| 수정 | `src/components/BottomNavigation.css` | 네비게이션 컬러 → CSS 변수 |
| 수정 | `src/components/Home.css` | 다크 테마 컬러 → CSS 변수 |
| 수정 | `src/components/SearchCategory.css` | 다크 테마 + 좋아요 컬러 → CSS 변수 |
| 수정 | `src/components/TemplateDetail.css` | 액센트 + 배경 컬러 → CSS 변수 |
| 수정 | `src/components/ContentUploadScreen.css` | 라이트 테마 컬러 → CSS 변수 |
| 수정 | `src/components/StoryPlanningScreen.css` | 다크 테마 컬러 → CSS 변수 |
| 수정 | `src/components/StoryEdit/StoryEdit.css` | 로컬 CSS 변수 → 글로벌 토큰 매핑 |
| 수정 | `src/components/StoryEdit/CutTabBar.css` | 파란색/빨간색 → Yellow/Orange 토큰 |
| 수정 | `src/components/StoryEdit/SubtitleSection.css` | 파란색 → Yellow 토큰 |
| 수정 | `src/components/StoryEdit/ContentPlan.css` | 그레이 → CSS 변수 |
| 수정 | `src/components/VideoEditor/VideoEditor.css` | 로컬 CSS 변수 → 글로벌 토큰 매핑 |
| 수정 | `src/components/VideoEditor/EditorHeader.css` | 주황색 + 배경 → CSS 변수 |
| 수정 | `src/components/VideoEditor/EditorNavBar.css` | 네비게이션 컬러 → CSS 변수 |
| 수정 | `src/components/VideoEditor/VideoPreview.css` | 자막/배경 컬러 → CSS 변수 |
| 수정 | `src/components/VideoEditor/Track.css` | 클립 컬러 → CSS 변수 |
| 수정 | `src/components/VideoEditor/Timeline.css` | 플레이헤드/배경 → CSS 변수 |
| 수정 | `src/components/ExportPreview/ExportPreview.css` | 전체 컬러 → CSS 변수 |
| 수정 | `src/components/Editor.css` | 배경 컬러 → CSS 변수 |

---

### v1.20.0 (2026-01-27)
**로그 한글 라벨 자동 생성 + 편집/내보내기 화면 로그 추가**

logger.js에 화면·이벤트·대상 매핑 테이블 및 `generateLabel()` 함수를 추가하여 모든 로그에 한글 라벨(`label`)이 자동 생성되도록 개선. 편집기·내보내기 미리보기 화면에 사용자 행동 로그를 추가.

주요 변경:
- **logger.js** — `SCREEN_LABELS`(12화면), `EVENT_LABELS`(5종), `TARGET_LABELS`(40+대상) 매핑 테이블 추가
- **logger.js** — `generateLabel(screen, event, target)` 함수: 화면+이벤트+대상 조합으로 한글 라벨 자동 생성 (예: `'내보내기 버튼 클릭'`)
- **logger.js** — `sendLog()` payload에 `label` 필드 자동 포함, `userAgent` → `browser` 필드명 수정
- **VideoEditor.jsx** — 11개 로그 추가 (screen_view, back, undo, redo, export, video_play/pause, timeline_seek, timeline_scroll, nav_tab_change)
- **Timeline.jsx** — `onScroll` prop 추가 (타임라인 스크롤 로그 전달)
- **ExportPreview.jsx** — 10개 로그 추가 (screen_view, back, video_play/pause, open/close_settings, setting_change, export_start, export_complete, go_home)
- **Google Apps Script** — `data.label` 컬럼("행동") 추가, `data.browser` 필드 대응

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 수정 | `src/utils/logger.js` | 매핑 테이블 + generateLabel + label 필드 + browser 필드명 |
| 수정 | `src/components/VideoEditor/VideoEditor.jsx` | 11개 로그 핸들러 추가, 타임라인 스크롤 디바운스 |
| 수정 | `src/components/VideoEditor/Timeline.jsx` | onScroll prop 추가 |
| 수정 | `src/components/ExportPreview/ExportPreview.jsx` | 10개 로그 핸들러 추가 |
| 수정 | `src/components/StoryEdit/SubtitleSection.css` | AI 버튼 레이아웃 안정화 (flex-shrink, white-space) |

---

### v1.19.0 (2026-01-27)
**콘텐츠 기획 화면 로그 추가 — 사용자 행동 분석 강화**

ContentUploadScreen에 7개 신규 로그 추가, 기존 `timeline_cut_select`에 컷 번호 value 보강.

주요 변경:
- **뒤로가기** 버튼 로그 추가 (이탈률 측정)
- **+ 버튼** (영상 추가 트리거) 로그 추가 (버튼 클릭 vs 실제 업로드 비교)
- **AI 추천 자막 선택** 로그 추가 (선택한 자막 텍스트 기록)
- **자막 입력 focus/blur** 로그 추가 (직접 입력 vs AI 추천 비율 분석)
- **duration 칩 클릭** 별도 로그 분리 (썸네일 탭 vs duration 칩 사용 비율)
- **스크롤** 로그 추가 (디바운스 500ms, 콘텐츠 소비 깊이 측정)
- 기존 `timeline_cut_select`에 컷 번호 value 추가

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 수정 | `src/components/ContentUploadScreen.jsx` | 7개 신규 로그 핸들러 추가, 스크롤 디바운스 로직 |

---

### v1.18.0 (2026-01-27)
**스토리 기획 화면 로그 추가 — 사용자 행동 분석 강화**

StoryPlanningScreen에 5개 신규 로그 추가 및 logger.js에 `logScroll` 함수 추가.

주요 변경:
- **영상 재생/일시정지** 로그 추가 (`video_play` / `video_pause`)
- **컷 1~6번 클릭** 로그 추가 (`cut_select`, value: 컷 번호)
- **스크롤** 로그 추가 (디바운스 500ms, 위치 % 기록)
- `logger.js`에 `logScroll` 함수 신규 추가

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 수정 | `src/utils/logger.js` | `logScroll` 함수 추가, default export에 포함 |
| 수정 | `src/components/StoryPlanningScreen.jsx` | 영상 재생/일시정지, 컷 선택, 스크롤 로그 추가 |

---

### v1.17.0 (2026-01-27)
**VideoEditor 영상 편집 화면 — 타임라인 기반 편집 UI 구현**

StoryEdit에서 완성한 컷 데이터(영상, 자막, 썸네일)를 받아 타임라인 기반 영상 편집 화면을 신규 구현. 프리뷰 + 타임라인 + 하단 네비게이션 3영역 레이아웃.

주요 변경:
- `VideoEditor/` 폴더에 6개 컴포넌트(12파일) 신규 생성
- **VideoEditor.jsx**: 메인 컨테이너, `convertToTimeline()` — cuts 배열 → video/text 트랙 변환, 100ms 인터벌 재생 로직, `useMemo` 기반 파생 상태
- **EditorHeader.jsx**: 뒤로가기 + "새 프로젝트", Undo/Redo 버튼, 주황색 "내보내기" 버튼
- **VideoPreview.jsx**: 9:16 비율 검정 프레임, 자막 오버레이 (노란색 bold + text-shadow), 재생 컨트롤바
- **Timeline.jsx**: 적응형 시간 눈금 (1초/5초/10초 간격), 노란색 플레이헤드 (세로선 + 삼각형), 클릭→시간 이동, 가로 스크롤
- **Track.jsx**: 재사용 가능한 트랙 행 — voice(🎤녹색)/text(Aa노랑)/bgm(🎵연노랑)/video(🎬썸네일)
- **EditorNavBar.jsx**: 하단 5탭 — 미디어/필터/BGM/TTS음성/자막, active 시 #FAFF5E
- **App.jsx 수정**: `editorCuts` state 추가, `handleStoryEditComplete` → cuts 저장 후 VideoEditor 렌더, BottomNavigation 조건부 숨김
- **ExportPreview 연동**: 내보내기 버튼 → ExportPreview 컴포넌트 표시

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 생성 | `src/components/VideoEditor/VideoEditor.jsx` | 메인 컨테이너 (convertToTimeline, 재생 로직, 상태 관리) |
| 생성 | `src/components/VideoEditor/VideoEditor.css` | CSS 변수 정의, 3영역 레이아웃 (65% preview + 35% timeline + 60px nav) |
| 생성 | `src/components/VideoEditor/EditorHeader.jsx` | 헤더 (뒤로가기, Undo/Redo, 내보내기) |
| 생성 | `src/components/VideoEditor/EditorHeader.css` | 헤더 스타일 |
| 생성 | `src/components/VideoEditor/VideoPreview.jsx` | 영상 프레임 + 자막 오버레이 + 재생 컨트롤 |
| 생성 | `src/components/VideoEditor/VideoPreview.css` | 9:16 프레임, 자막 스타일 |
| 생성 | `src/components/VideoEditor/Timeline.jsx` | 시간 눈금 + 플레이헤드 + 트랙 컨테이너 |
| 생성 | `src/components/VideoEditor/Timeline.css` | 가로 스크롤, 플레이헤드 스타일 |
| 생성 | `src/components/VideoEditor/Track.jsx` | 개별 트랙 행 (voice/text/bgm/video 4종) |
| 생성 | `src/components/VideoEditor/Track.css` | 트랙별 클립 색상 |
| 생성 | `src/components/VideoEditor/EditorNavBar.jsx` | 하단 5탭 네비게이션 |
| 생성 | `src/components/VideoEditor/EditorNavBar.css` | 60px 고정, BottomNavigation 패턴 |
| 수정 | `src/App.jsx` | editorCuts state, VideoEditor import/라우팅, BottomNav 조건부 숨김 |

---

### v1.16.0 (2026-01-27)
**StoryEdit IndexedDB 영속 저장 — 영상 Blob 데이터 보호**

StoryEdit에서 업로드한 영상 파일(Blob)과 편집 상태를 IndexedDB에 저장하여, 페이지 이탈/새로고침 후에도 작업 내용을 복원할 수 있도록 개선.

주요 변경:
- `storyEditDB.js` 유틸리티 신규 생성 — IndexedDB CRUD 4개 함수
  - `saveCut()`: 개별 컷 저장 (영상 Blob, 썸네일, 자막, 완료 상태)
  - `saveAllCuts()`: 전체 컷 + 세션 메타(현재 컷 인덱스, 저장 시각) 일괄 저장
  - `loadAllCuts()`: 유저+템플릿 기준으로 저장된 컷 전체 로드 + Blob → ObjectURL 복원
  - `deleteAllCuts()`: 특정 유저+템플릿의 모든 데이터 삭제
- DB 스키마: `hookhook_storyedit` DB, `cuts` Object Store, 복합 인덱스 `[userId, templateId]`
- 키 구조: `{userId}_{templateId}_{cutId}` (유저별·템플릿별 격리)
- StoryEdit.jsx 연동:
  - 초기화 시 `loadAllCuts()`로 기존 데이터 복원
  - 영상 업로드 즉시 `saveCut()`으로 개별 저장 (이탈 시 데이터 보호)
  - "저장하기" 클릭 시 `saveAllCuts()`로 전체 저장
- 기존 localStorage 임시 저장 → IndexedDB 영속 저장으로 교체

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 생성 | `src/utils/storyEditDB.js` | IndexedDB CRUD (saveCut, saveAllCuts, loadAllCuts, deleteAllCuts) |
| 수정 | `src/components/StoryEdit/StoryEdit.jsx` | IndexedDB import 및 저장/복원 로직 추가 |

---

### v1.15.0 (2026-01-27)
**StoryEdit 화면 통합 — 스토리 기획 + 콘텐츠 업로드 → 단일 화면으로 교체**

기존 2개 화면(`StoryPlanningScreen` + `ContentUploadScreen`)을 1개의 `StoryEdit` 화면으로 통합하여 화면 전환 흐름을 단순화.

- **변경 전**: TemplateDetail → StoryPlanningScreen → ContentUploadScreen → Editor
- **변경 후**: TemplateDetail → **StoryEdit** → Editor

주요 변경:
- `StoryEdit/` 폴더에 4개 컴포넌트 신규 생성 (StoryEdit, CutTabBar, ContentPlan, SubtitleSection)
- 컷 탭 바: 완료(썸네일)/현재(연핑크 `+`)/대기(회색 duration) 3가지 상태, 하단 파란색 진행 바
- 콘텐츠 기획 카드: 읽기 전용 컷 정보 표시
- 자막 섹션: AI 자막 추천 (키워드 기반 폴백), 추천 칩 선택
- 영상 업로드: Canvas 썸네일 자동 생성
- 저장하기: localStorage 임시 저장 + 토스트 메시지
- 완성하기: 전체 저장 후 Editor로 이동
- App.jsx: `storyEdit` 라우팅 추가 (기존 `storyPlanning`/`contentUpload`는 레거시로 유지)
- TemplateDetail: `onStoryEdit` prop 추가

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| 생성 | `src/components/StoryEdit/StoryEdit.jsx` | 메인 컨테이너 (상태 관리, 영상 업로드, AI 자막, 저장/완성) |
| 생성 | `src/components/StoryEdit/StoryEdit.css` | CSS 변수 체계, 레이아웃, 토스트 애니메이션 |
| 생성 | `src/components/StoryEdit/CutTabBar.jsx` | 가로 스크롤 컷 탭 바 + 진행 바 |
| 생성 | `src/components/StoryEdit/CutTabBar.css` | 탭 3상태 스타일, 진행 바 |
| 생성 | `src/components/StoryEdit/ContentPlan.jsx` | 읽기 전용 콘텐츠 기획 카드 |
| 생성 | `src/components/StoryEdit/ContentPlan.css` | 카드 스타일 |
| 생성 | `src/components/StoryEdit/SubtitleSection.jsx` | 자막 입력 + AI 추천 칩 |
| 생성 | `src/components/StoryEdit/SubtitleSection.css` | 자막 섹션 스타일 |
| 수정 | `src/App.jsx` | StoryEdit import, 핸들러 추가, storyEdit 라우팅 추가 |
| 수정 | `src/components/TemplateDetail.jsx` | `onStoryEdit` prop 추가 |

---

### v1.14.1 (2026-01-26)
**온보딩 화면 모바일 뷰포트 대응 수정**
- `.category-container`의 고정 높이(`min-height: 852px`, `max-height: 852px`) 제거
- 모바일 실제 뷰포트에 맞춰 유동적으로 높이 조절되도록 변경
- 모바일에서 "다음" 버튼이 화면 밖으로 밀려나는 문제 해결

**알려진 이슈 (분석 완료)**
- 스토리 기획 프로그레스 바: `progressWidths`가 6개로 하드코딩되어 있어 `template.cuts`가 5일 때 마지막 세그먼트가 활성화되지 않는 문제 확인

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Category.css` | `min-height: 852px`, `max-height: 852px` 제거 |

---

### v1.14.0 (2026-01-26)
**스토리 기획 화면 리디자인 및 템플릿 상세 개선**
- 스토리 기획 화면 전면 리디자인 (레이아웃, 스타일 개편)
- 템플릿 상세 화면 UI 개선 (레이아웃, 스타일 개편)
- App.jsx 화면 전환 로직 보강
- 디자인 참고 이미지 추가 (스토리기획 1~6, 템플릿화면 1~4)

| 파일 | 변경 내용 |
|------|----------|
| `src/components/StoryPlanningScreen.jsx` | 화면 구조 및 UI 리디자인 |
| `src/components/StoryPlanningScreen.css` | 전체 스타일 개편 |
| `src/components/TemplateDetail.jsx` | 화면 구조 및 UI 개선 |
| `src/components/TemplateDetail.css` | 전체 스타일 개편 |
| `src/App.jsx` | 화면 전환 로직 보강 |

---

### v1.13.0 (2026-01-26)
**템플릿 상세 화면 개선**
- TemplateDetail 화면 CSS 및 레이아웃 조정
- 스토리보드 이미지 추가

| 파일 | 변경 내용 |
|------|----------|
| `src/components/TemplateDetail.jsx` | 레이아웃 조정 |
| `src/components/TemplateDetail.css` | 스타일 개선 |

---

### v1.12.0 (2026-01-25)
**홈 화면 리디자인 및 전체 디자인 시스템 적용**
- 홈 화면 전면 리디자인 (Home.jsx, Home.css 대규모 변경)
- 하단 네비게이션 리디자인
- 카테고리 온보딩 CSS 전면 개편 (다크 테마 강화, 카드/버튼 스타일 개선)
- 검색 카테고리 UI 개선
- 환경변수 파일(`.env`, `.env.example`) 추가

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Home.jsx` | 홈 화면 전면 리디자인 |
| `src/components/Home.css` | 홈 스타일 전면 개편 |
| `src/components/BottomNavigation.jsx` | 네비게이션 리디자인 |
| `src/components/BottomNavigation.css` | 네비게이션 스타일 개선 |
| `src/components/Category.css` | 온보딩 카드/버튼 스타일 전면 개편 |
| `src/components/CategoryPurpose.jsx` | 로깅 추가 |
| `src/components/CategoryTopic.jsx` | 로깅 추가 |
| `src/components/CategoryPlatform.jsx` | 체크 표시 제거, 로깅 추가 |
| `src/components/SearchCategory.css` | 검색 UI 개선 |
| `src/App.jsx` | 화면 전환 로직 개선 |
| `src/App.css` | 모바일 프레임 스타일 조정 |

---

### v1.11.0 (2026-01-25)
**온보딩 카드 선택 효과 개선**
- 선택된 카드에 노란색(#FAFF5E) 투명 배경 오버레이 추가 (15% 투명도)
- 플랫폼 선택 화면의 체크 표시(✓) 제거
- 테두리는 기존과 동일하게 유지
- Purpose, Topic, Platform 세 화면 모두 동일한 선택 효과 적용

| 파일 | 변경 내용 |
|------|----------|
| `src/components/CategoryPlatform.jsx` | 체크 표시 span 요소 제거 |
| `src/components/Category.css` | selected 클래스에 투명 배경 오버레이 추가, platform-check 스타일 제거 |

---

### v1.10.1 (2026-01-24)
**온보딩 화면 다크 테마 및 디자인 시스템 적용**
- 전체 온보딩 화면 다크 테마 적용 (배경색 #000000)
- 노란색(#FAFF5E) 디자인 시스템 적용 (프로그레스 바, 선택 테두리, 버튼)
- 카테고리 컨테이너 border-radius 제거
- 다음 버튼 크기 고정

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Category.css` | 다크 테마 색상, 프로그레스 바, 버튼 스타일 개선 |

---

### v1.10.0 (2026-01-23)
**콘텐츠 업로드 화면 레이아웃 개선**
- 미리보기 영역 UI 개선 (템플릿 썸네일 표시)
- 프로그레스 바 세그먼트 디자인 개선
- 컷 정보 카드 레이아웃 개선
- 전체적인 UI/UX 개선

| 파일 | 변경 내용 |
|------|----------|
| `src/components/ContentUploadScreen.jsx` | 미리보기 영역 및 UI 개선 |
| `src/components/ContentUploadScreen.css` | 레이아웃 스타일 개선 |

---

### v1.9.0 (2026-01-23)
**콘텐츠 업로드 화면 추가**
- `ContentUploadScreen` 컴포넌트 신규 생성
- 컷별 영상 업로드 기능
- 컷별 자막 입력 기능
- AI 추천자막 버튼 (UI 구현)
- 프로그레스 바로 진행 상태 표시
- 이전/다음 단계 네비게이션
- 모든 컷 완료 시 에디터로 자동 이동

| 파일 | 변경 내용 |
|------|----------|
| `src/components/ContentUploadScreen.jsx` | 콘텐츠 업로드 화면 신규 생성 |
| `src/components/ContentUploadScreen.css` | 콘텐츠 업로드 스타일 |
| `src/components/TemplateDetail.jsx` | 콘텐츠 업로드 버튼 추가 |
| `src/App.jsx` | contentUpload 화면 전환 로직 추가 |

---

### v1.8.1 (2026-01-23)
**스토리 기획 화면 개선**
- 메모 입력 필드 UI 개선
- 세그먼트 프로그레스 바 추가
- 컷 선택 시 시각적 피드백 강화

| 파일 | 변경 내용 |
|------|----------|
| `src/components/StoryPlanningScreen.jsx` | 메모 입력 필드 및 프로그레스 바 추가 |
| `src/components/StoryPlanningScreen.css` | 프로그레스 바 스타일 추가 |

---

### v1.8.0 (2026-01-21)
**스토리 기획 화면 추가**
- `StoryPlanningScreen` 컴포넌트 신규 생성
- 상단 고정 영상 프리뷰 (선택된 컷 타임스탬프 재생)
- 세그먼트 프로그레스 바 (컷별 진행 표시, 탭으로 컷 이동)
- 컷별 메모 입력 기능
- 하단 취소/저장 버튼

**TemplateDetail 개선**
- 스토리 기획 버튼 추가 (우측 플로팅 메뉴)
- 좋아요/저장 토글 버튼 추가
- 하단 CTA 영역 레이아웃 개선 (편집 시작하기 + 북마크)

| 파일 | 변경 내용 |
|------|----------|
| `src/components/StoryPlanningScreen.jsx` | 스토리 기획 화면 신규 생성 |
| `src/components/StoryPlanningScreen.css` | 스토리 기획 스타일 |
| `src/components/TemplateDetail.jsx` | 스토리 기획/좋아요/저장 버튼 추가 |
| `src/components/TemplateDetail.css` | CTA 버튼 영역 스타일 개선 |
| `src/App.jsx` | storyPlanning 화면 전환 로직 추가 |

---

### v1.7.0 (2026-01-21)
**샘플 비디오 및 템플릿→편집기 연동 추가**
- `public/videos/` 폴더에 샘플 비디오 2개 및 썸네일 추가
- 검색 화면에서 템플릿 클릭 시 해당 비디오로 편집기 자동 진입
- 편집기에서 외부 전달 비디오 URL 자동 로드 기능 추가
- 홈 화면 하단 네비게이션을 App.jsx로 이동

| 파일 | 변경 내용 |
|------|----------|
| `public/videos/` | sample-1.mp4, sample-1-thumb.png, sample-2.mp4, sample-2-thumb.png 추가 |
| `src/App.jsx` | `selectedVideoUrl` 상태, `handleTabChange` 데이터 처리 추가 |
| `src/components/SearchCategory.jsx` | 템플릿에 videoUrl 추가, 클릭 시 편집기 이동 기능 |
| `src/components/Editor.jsx` | `videoUrl`, `onVideoLoaded` props, 자동 로드 useEffect 추가 |
| `src/components/Home.jsx` | 하단 네비게이션 제거 |

---

### v1.6.0 (2026-01-20)
**텍스트 크기 조절 슬라이더 추가**
- 텍스트 선택 시 크기 조절 슬라이더 표시
- 12px ~ 72px 범위 조절 가능
- 현재 크기 실시간 표시

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Editor.jsx` | `handleTextSize`, `getEditingText` 함수, 슬라이더 UI 추가 |
| `src/components/Editor.css` | `.size-control`, `.size-slider`, `.size-value` 스타일 추가 |

---

### v1.5.0 (2026-01-20)
**Canvas 미리보기 동기화 - 편집/내보내기 일치**
- 미리보기 영역에 Canvas 레이어 추가
- 공통 텍스트 렌더링 함수 `drawTextOnCanvas` 구현
- 편집 화면과 내보내기 결과의 텍스트 크기/위치 100% 일치
- 편집용 투명 오버레이로 드래그/클릭 기능 유지

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Editor.jsx` | `previewCanvasRef`, `drawTextOnCanvas`, Canvas 미리보기 추가 |
| `src/components/Editor.css` | `.preview-canvas`, `.text-overlay-edit`, `.hidden-video` 스타일 추가 |

---

### v1.4.0 (2026-01-20)
**Canvas 기반 텍스트 포함 내보내기 기능 추가**
- Canvas + MediaRecorder 방식으로 텍스트 오버레이가 포함된 영상 내보내기
- 내보내기 방식 선택 모달 UI 추가
- 실시간 녹화 방식으로 한글 텍스트 완벽 지원
- WebM 형식 출력

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Editor.jsx` | `handleCanvasExport` 함수, 내보내기 옵션 모달 추가 |
| `src/components/Editor.css` | `.export-options-modal`, `.export-option-item` 스타일 추가 |

---

### v1.3.0 (2026-01-20)
**FFmpeg.wasm 내보내기 기능 추가**
- `@ffmpeg/ffmpeg`, `@ffmpeg/util` 패키지 추가
- 텍스트 오버레이가 적용된 영상 내보내기 기능
- 내보내기 진행률 UI 추가
- Vite 설정에 SharedArrayBuffer 지원 헤더 추가

| 파일 | 변경 내용 |
|------|----------|
| `package.json` | FFmpeg 패키지 의존성 추가 |
| `vite.config.js` | CORS 헤더 설정 추가 |
| `src/components/Editor.jsx` | FFmpeg 로드, 내보내기 함수, 진행 모달 추가 |
| `src/components/Editor.css` | 내보내기 모달 스타일 추가 |

---

### v1.2.0 (2026-01-20)
**텍스트 위치 조절 기능 개선**
- 9방향 프리셋 위치 버튼 추가 (↖↑↗←●→↙↓↘)
- 버튼 클릭 시 현재 위치에서 3%씩 이동 (약 10px)
- 중앙 버튼(●)은 정중앙(50%, 50%)으로 리셋
- 드래그 앤 드롭으로 미세 조정 가능

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Editor.jsx` | `handleTextPosition` 함수, 위치 조절 패널 UI 추가 |
| `src/components/Editor.css` | `.text-position-panel`, `.position-grid`, `.position-btn` 스타일 추가 |

---

### v1.1.0 (2026-01-20)
**편집기 UI 개선**
- 자막 추가 버튼 섹션 제거
- 음악 트랙 섹션 제거
- 타임라인 트랙 높이 증가 (28px → 44px)

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Editor.jsx` | `subtitle-section`, `music-track-section` 제거 |
| `src/components/Editor.css` | `.timeline-track` 높이 44px로 변경 |

---

### v1.0.0 (2026-01-20)
**초기 버전**
- 로그인 화면 (Google OAuth)
- 온보딩 플로우 (목적/주제/플랫폼 선택)
- 홈 화면 (3D 캐러셀 템플릿 추천)
- 영상 편집기 (미디어, 텍스트, 자막, BGM, 음성 녹음, 타임라인)

---

*Last updated: 2026-01-30 (v1.23.0)*
