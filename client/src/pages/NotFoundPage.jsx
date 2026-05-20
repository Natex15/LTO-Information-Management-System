import { useNavigate } from "react-router-dom";
import './NotFoundPage.css';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const hasToken = !!localStorage.getItem("token");

    return (
        <div className="notfound-container">
            <div className="glow-effect glow-orange"></div>
            <div className="glow-effect glow-red"></div>

            <div className="notfound-card">
                <div className="traffic-light-container">
                    <div className="traffic-light">
                        <div className="light red active"></div>
                        <div className="light yellow"></div>
                        <div className="light green"></div>
                    </div>
                </div>

                <h1 className="notfound-code">404</h1>
                <h2 className="notfound-title">Roadblock Ahead</h2>
                <p className="notfound-description">
                    The route you are trying to navigate does not exist or has been permanently redirected. 
                    Let's get you back on the right track.
                </p>

                <div className="notfound-actions">
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Drive Back
                    </button>
                    <button className="btn-home" onClick={() => navigate(hasToken ? "/dashboard" : "/")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        {hasToken ? "Dashboard" : "Login Screen"}
                    </button>
                </div>
            </div>
        </div>
    );
}
