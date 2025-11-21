import React, { useState } from 'react';

function SignupPage() {
  const [accountType, setAccountType] = useState('individual');
  
 
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '', 
  });

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  //  form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- Validation and API Call Logic Goes Here ---
    console.log('Account Type:', accountType);
    console.log('Form Data:', formData);
    
    if (accountType === 'organization') {
     
      console.log(`Organization ${formData.organizationName} registering.`);
     
    } else {
      
      console.log('Individual registering.');
      
    }
  };

  return (
    <div className="signup-page">
      <h2>Create Your Account</h2>

      <div className="account-type-selector">
        <button 
          className={accountType === 'individual' ? 'active' : ''}
          onClick={() => setAccountType('individual')}
        >
          Individual (Student/Parent)
        </button>
        <button 
          className={accountType === 'organization' ? 'active' : ''}
          onClick={() => setAccountType('organization')}
        >
          Organization (Teacher/School)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        
       
        {accountType === 'organization' && (
          <div className="form-group">
            <label htmlFor="organizationName">Organization/School Name *</label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
              placeholder="E.g., Green Hills Elementary"
            />
          </div>
        )}
        
    
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@school.edu"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="primary-button signup-button">
          {accountType === 'organization' ? 'Register School & Go to Dashboard' : 'Create Individual Account'}
        </button>
      </form>
    </div>
  );
}

export default SignupPage;