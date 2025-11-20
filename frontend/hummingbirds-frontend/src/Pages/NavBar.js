import React from 'react';
import logoimg from './HUMMINGBIRDS.png';

function NavBar() {
  return (
    <nav className="navbar">

      <div className="navbar-logo">
        <a href="/">
        <img 
            src= {logoimg}
            alt="Tree Planting Logo" 
            className="logo-img"
          />
         </a>
      </div>

      {/* Right Side: Action Buttons */}
      <div className="navbar-actions">
        <button className="nav-button login-button">
          Login
        </button>
        <button className="nav-button get-started-button">
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default NavBar;