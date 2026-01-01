import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400">404</h1>
        <p className="mt-2 text-lg text-gray-600">Page not found</p>
        <div className="mt-6 space-x-4">
          <Link to="/employee" className="text-indigo-600 hover:underline">
            Employee Portal
          </Link>
          <Link to="/hr" className="text-rose-600 hover:underline">
            HR Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
