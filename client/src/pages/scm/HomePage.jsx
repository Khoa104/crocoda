// client/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function HomePage() {
  const { isAuthenticated, currentUser } = useAuth();
  return (
    <div>
      <h1>Welcome to the Purchase Order Management System!</h1>
      {isAuthenticated && currentUser ? (
        <div>
          <p>Hello, {currentUser.username || currentUser.full_name || currentUser.email}!</p>
          <p>
            You can now proceed to <Link to="/po-manage">Manage Purchase Orders</Link>.
          </p>
        </div>
      ) : (
        <div>
          <p>This system helps you manage your purchase orders efficiently.</p>
          <p>
            Please <Link to="/login">Login</Link> to access all features, or <Link to="/signup">Sign Up</Link> if you don't have an account.
          </p>
        </div>
      )}
    </div>
  );
}

export default HomePage;