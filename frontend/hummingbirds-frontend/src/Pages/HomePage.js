import React from 'react';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import HowItWorks from './HowItWorks';
import NavBar from './NavBar';
import '../App.css';




function HomePage() {
  return (
    <div className="landing-page">
      <NavBar />
      <HeroSection /> 
      <FeatureSection />
      <HowItWorks />
    </div>
  );
}

export default HomePage;