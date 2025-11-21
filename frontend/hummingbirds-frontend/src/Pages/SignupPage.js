import React, { useState } from 'react';
import './SignupPage.css';




function SignupPage() {
  const [accountType, setAccountType] = useState('individual');
  
 
  const [formData, setFormData] = useState({
    email: '',
    phonenumber: '',
    organizationName: '',
    description: '',
    
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
      <h2>SignUp</h2>

      <div className="account-type-selector">
        <button 
          className={accountType === 'individual' ? 'active' : ''}
          onClick={() => setAccountType('individual')}
        >
          Individual 
        </button>
        <button 
          className={accountType === 'organization' ? 'active' : ''}
          onClick={() => setAccountType('organization')}
        >
          Organization 
        </button>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        
       
        {accountType === 'organization' && (
  <>
    <div className="form-group">
      <label htmlFor="organizationName">Organization/School Name *</label>
      <input
        type="text"
        id="organizationName"
        name="organizationName"
        value={formData.organizationName || ''}
        onChange={handleChange}
        required
        placeholder="E.g., Green Hills Elementary"
      />
    </div>

    <div className="form-group">
      <label htmlFor="description">Organization Description *</label>
      <textarea
        id="description"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        required
        placeholder="Briefly describe your organization..."
      ></textarea>
    </div>
  </>
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
          <label htmlFor="phone">Phone Number *</label>
<input
  type="tel"
  id="phone"
  name="phonenumber"
  value={formData.phonenumber}
  onChange={handleChange}
  required
  placeholder="e.g. +254712345678"
/>

        </div>
        

        <button type="submit" className="primary-button signup-button">
          {accountType === 'organization' ? 'Register Organization ' : 'Create Account'}
        </button>
      </form>
      <div className='Login'>
  <p>
    Already have an account?{' '}
    <span style={{ color: '#003220' }}>Login</span>
  </p>
</div>
    </div>
  );
}

export default SignupPage;