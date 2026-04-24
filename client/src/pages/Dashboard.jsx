import Sidebar from "../components/Sidebar";
import './Dashboard.css';

export default function Dashboard() {
    return (
    <>
        <Sidebar />
        <div className="header">
            <div className="greeting">
                <h1>Welcome Admin!</h1>
            </div>
        </div>
    </>
    );
}