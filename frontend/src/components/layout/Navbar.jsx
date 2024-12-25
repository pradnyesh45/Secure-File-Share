import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Secure File Share</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="flex space-x-4">
              <Link
                to="/files"
                className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                My Files
              </Link>
              <Link
                to="/shared"
                className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-gray-900"
              >
                Shared with Me
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
