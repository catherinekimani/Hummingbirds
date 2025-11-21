import React from 'react';
import treeimg from './tree.jpg'

function HeroSection() {
  return (
    <header className="hero-section">
      <div className="hero-content">
        <h1>Lets Grow a Greener Future, One Tree at a Time.</h1>
        <p>Hummingbirds is a platform to plant, track and earn rewards for real-world environmental action.</p>
        
        <div className="hero-cta">
          <button className="primary-button">
            Register Today
          </button>
          <button className="secondary-button">
            How To Plant Better Trees
          </button>
        </div>
      </div>
      
      <div className="hero-image">
         <img 
                    src= {treeimg}
                    alt="Tree Planting " 
                    className="tree-img"
                  />
        
      </div>
    </header>
  );
}

export default HeroSection;