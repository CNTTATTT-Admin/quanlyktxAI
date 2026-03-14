import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';

const UserLayout = ({ authenticated, currentUser, onLogout }) => {
  return (
    <>
      <Header authenticated={authenticated} currentUser={currentUser} onLogout={onLogout} />
      <main style={{ minHeight: '80vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
