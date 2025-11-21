import React from 'react';

const FeatureCard = ({ title, description, icon }) => (
  <div className="feature-card">
    <span className="feature-icon">{icon}</span>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

function FeatureSection() {
  return (
    <section className="feature-section">
      <h2>The Power of Planting & Tracking</h2>
      
      <div className="features-container">
        <FeatureCard 
          title="Effortless Class Management"
          description="Create and manage individual student accounts under one unified school profile."
        />
        <FeatureCard 
          title="Measure Your Impact"
          description="Track your school's collective environmental contribution with real-time analytics."
        />
      
        <FeatureCard 
          title="My Tree, My Code"
          description="Each tree gets a unique code for personal ownership and verifiable tracking."
        />
        <FeatureCard 
          title="Level Up Your Tree"
          description="Gamified progress and rewards for successful growth, turning care into a challenge."
        />
      </div>
    </section>
  );
}

export default FeatureSection;