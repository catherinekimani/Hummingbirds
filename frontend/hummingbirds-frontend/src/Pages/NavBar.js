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

      <div className="navbar-actions">
        <button className="login-button">
          LOGIN
        </button>
        <button className="get-started-button">
          GET STARTED
        </button>
      </div>
    </nav>
  );
}

export default NavBar;