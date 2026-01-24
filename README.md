# HookHook - 숏폼 영상 편집 앱

모바일 숏폼 영상 제작을 위한 React 기반 웹 애플리케이션 프로토타입입니다.

## 기술 스택

- **React** 19.2.0
- **Vite** 7.2.4
- **Google OAuth** (@react-oauth/google)
- **FFmpeg.wasm** (@ffmpeg/ffmpeg)

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
- **스토리 기획 버튼**: 탭 시 스토리 기획 화면으로 이동
- **콘텐츠 업로드 버튼**: 탭 시 콘텐츠 업로드 화면으로 이동
- 해시태그 표시
- "편집 시작하기" CTA 버튼
- 저장/북마크 버튼

### 6. 스토리 기획 (`StoryPlanningScreen`)
- **상단 고정 영상 프리뷰**: 선택된 컷의 타임스탬프 재생
- **세그먼트 프로그레스 바**: 컷 위치 시각화, 선택된 컷까지 활성화
- **컷 리스트**:
  - 컷별 제목, 설명, 시간 표시
  - 선택 시 메모 입력 필드 표시
  - 테두리 강조로 선택 상태 표시
- **하단 버튼**: 취소/저장하기

### 7. 콘텐츠 업로드 (`ContentUploadScreen`)
- **미리보기 영역**: 템플릿 썸네일 또는 업로드된 영상 표시
- **프로그레스 바**: 현재 컷 진행 상태 시각화
- **컷 정보 카드**: 컷 번호, 제목, 설명, 시간, 메모 표시
- **영상 추가**: 컷별 영상 파일 업로드
- **자막 입력**: 컷별 자막 텍스트 입력
- **AI 추천자막**: AI 기반 자막 추천 버튼
- **이전/다음 단계 버튼**: 컷 간 네비게이션

### 8. 영상 편집기 (`Editor`)
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
│   ├── StoryPlanningScreen.jsx # 스토리 기획
│   ├── StoryPlanningScreen.css
│   ├── ContentUploadScreen.jsx # 콘텐츠 업로드
│   ├── ContentUploadScreen.css
│   ├── BottomNavigation.jsx   # 하단 네비게이션
│   ├── BottomNavigation.css
│   ├── Editor.jsx             # 영상 편집기
│   └── Editor.css
└── utils/
    └── logger.js          # 로깅 유틸리티
```

## 환경 변수 설정

루트 디렉토리에 `.env` 파일 생성 (`.env.example` 참조):

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_SCRIPT_URL=your_google_apps_script_url
```

| 변수 | 설명 |
|------|------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `VITE_GOOGLE_SCRIPT_URL` | Google Apps Script 엔드포인트 (분석 로깅용) |

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
                              템플릿 탐색            편집기
                                    ↓
                              템플릿 상세
                                    ↓
                        ┌───────────┴───────────┐
                        ↓                       ↓
                  스토리 기획            콘텐츠 업로드
                                              ↓
                                           편집기
```

---

## 버전 히스토리

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

*Last updated: 2026-01-25*
