import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userName = user?.username || user?.name;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl font-bold tracking-tight">
              <span style={{ color: "#ed4d4e" }}>CYF</span>
              <span style={{ color: "#281d80" }}>overflow</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
            >
              Home
            </Link>

            {isLoggedIn ? (
              <>
                <span className="text-gray-700 px-4 py-2 text-base font-medium">
                  Welcome,{" "}
                  <span className="text-[#281d80] font-semibold">
                    {userName}
                  </span>
                  !
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-[#ed4d4e] text-white px-6 py-2.5 rounded-lg text-base font-semibold hover:bg-[#d43d3e] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#281d80] px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#281d80] text-white px-6 py-2.5 rounded-lg text-base font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
