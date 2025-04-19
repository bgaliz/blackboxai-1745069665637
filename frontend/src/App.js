import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (token) => {
    setToken(token);
  };

  const handleLogout = () => {
    setToken(null);
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {showRegister ? (
          <>
            <Register onRegister={toggleRegister} />
            <p className="mt-4 text-center">
              Already have an account?{' '}
              <button className="text-blue-600 underline" onClick={toggleRegister}>
                Login
              </button>
            </p>
          </>
        ) : (
          <>
            <Login onLogin={handleLogin} />
            <p className="mt-4 text-center">
              Don't have an account?{' '}
              <button className="text-blue-600 underline" onClick={toggleRegister}>
                Register
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to AVA System</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}

export default App;
