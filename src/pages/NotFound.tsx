import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 bg-dark-card hover:bg-gray-800 text-white font-medium rounded-lg border border-dark-border transition-colors"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;