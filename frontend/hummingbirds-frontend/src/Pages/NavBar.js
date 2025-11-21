import React from 'react';
import logoimg from './HUMMINGBIRDS.png';
import { Link } from 'react-router-dom';

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
        <button className="nav-button login-button">
          LOGIN
        </button>

       <Link to="/signup">
  <button className="nav-button get-started-button">
    GET STARTED
  </button>
</Link>

      </div>
    </nav>
  );
}

export default NavBar;