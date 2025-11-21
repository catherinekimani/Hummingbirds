import React from 'react';
import HeroSection from './Pages/HeroSection';
import FeatureSection from './Pages/FeatureSection';
import HowItWorks from './Pages/HowItWorks';
import NavBar from './Pages/NavBar';
import './App.css';

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

