export default function NoticeBanner({ notice, setNotice, error, setError }) {
 return <>{notice && <div className="notice"><span>✓</span>{notice}<button onClick={() => setNotice('')}>×</button></div>}{error && <div className="error-banner">{error}<button onClick={() => setError('')}>×</button></div>}</>;
}
