import "./Topbar.css";
import { useNavigate } from "react-router-dom";


export default function Topbar({
  user,
}) {

  const navigate = useNavigate();

  return (
    <div className="topbar">      
       <div
        className="profile-section"
        onClick={() =>
          navigate("/profile")
        }
      >
        <div className="profile-info">
          <div>{user.name}</div>

          <div className="profile-branch">
            {user.branch}
          </div>
        </div>

        <div className="avatar">
          {user.name
            ? user.name[0].toUpperCase()
            : "U"}
        </div>
      </div>
    </div>
  );
}