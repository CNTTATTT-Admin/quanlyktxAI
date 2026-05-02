import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

const UserLayout = ({ authenticated, currentUser, onLogout, loadCurrentUser }) => {
  const location = useLocation();

  useEffect(() => {
    if (authenticated && typeof loadCurrentUser === 'function') {
      loadCurrentUser();
    }
  }, [authenticated, location.pathname, loadCurrentUser]);

  return (
    <>
      <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
    </>
  );
};

export default UserLayout;
