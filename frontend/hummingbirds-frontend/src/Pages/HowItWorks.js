import React from 'react';

const Step = ({ number, title, description }) => (
  <div className="step-card">
    <div className="step-number">{number}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2>Getting Started is Simple</h2>
      <div className="steps-container">
        <Step 
          number="1" 
          title="Register Your School" 
          description="Teachers sign up as an organization and quickly create accounts for their students." 
        />
        <Step 
          number="2" 
          title="Plant & Upload" 
          description="Students plant their tree, upload a photo and receive their unique tracking code." 
        />
        <Step 
          number="3" 
          title="Track, Earn & Grow" 
          description="Students monitor their tree's status and earn rewards as it levels up and thrives." 
        />
      </div>
      
      
      <h3 className="impact-stat">Join 50+ schools already making a difference!</h3>
    </section>
  );
}

export default HowItWorks;