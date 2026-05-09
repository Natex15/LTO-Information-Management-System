import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" />;
    }

    return (
        <div style={{ paddingLeft: '80px', width: '100%', boxSizing: 'border-box' }}>
            {children}
        </div>
    );
}

export default ProtectedRoute;