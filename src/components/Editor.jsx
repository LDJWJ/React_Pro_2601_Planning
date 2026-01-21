function Editor({ onBack, videoUrl, onVideoLoaded }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5'
        }}>
            <h2>편집기 화면</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                향후 새로운 편집기 컴포넌트로 교체될 예정입니다.
            </p>
            {videoUrl && (
                <p style={{ fontSize: '14px', color: '#999' }}>
                    비디오 URL: {videoUrl}
                </p>
            )}
            <button
                onClick={onBack}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                뒤로 가기
            </button>
        </div>
    );
}

export default Editor;
