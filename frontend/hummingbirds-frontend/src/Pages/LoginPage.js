import React, { useState } from 'react';
import './SignupPage.css';
import { Link } from 'react-router-dom';


function LoginPage() {
  const [loginType, setLoginType] = useState('individual'); // individual, organization, student
  const [formData, setFormData] = useState({
    email: '',
    phonenumber: '',
    orgName: '',
    admissionNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Type:', loginType);
    console.log('Form Data:', formData);

    if (loginType === 'individual') {
      console.log(`Logging in individual with email: ${formData.email}`);
    } else if (loginType === 'organization') {
      console.log(`Logging in organization with email: ${formData.email}`);
    } else if (loginType === 'student') {
      console.log(`Student logging in. Admission: ${formData.admissionNumber}, School: ${formData.orgName}`);
    }
    // TODO: call your API or check credentials here
  };

  return (
    <div className="login-page">
      <h2>Login</h2>

      <div className="login-type-selector">
        <button
          className={loginType === 'individual' ? 'active' : ''}
          onClick={() => setLoginType('individual')}
        >
          Individual
        </button>
        <button
          className={loginType === 'organization' ? 'active' : ''}
          onClick={() => setLoginType('organization')}
        >
          Organization
        </button>
        <button
          className={loginType === 'student' ? 'active' : ''}
          onClick={() => setLoginType('student')}
        >
          Student
        </button>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        {loginType === 'individual' && (
          <>

      <div className="form-group">
      <label htmlFor="username">Username *</label>
      <input
        type="text"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
        placeholder="Enter your username"
      />
    </div>

    <div className="form-group">
    <label htmlFor="contact">Email / Phone Number *</label>
    <input
      type="text"
      id="contact"
      name="contact"
      value={formData.contact}
      onChange={handleChange}
      required
      placeholder="Enter email or phone number"
    />
     </div>
     </>

        ) }
        
        
       {loginType === 'organization' && (
          <>
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

          <div className="form-group">
          <label htmlFor="contact">Email / Phone Number *</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            placeholder="Enter email or phone number"
          />
        </div>
            
          </>
        )}

        {loginType === 'student' && (
          <>
            <div className="form-group">
              <label htmlFor="admissionNumber">Admission Number *</label>
              <input
                type="text"
                id="admissionNumber"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleChange}
                required
                placeholder="e.g. 2025-001"
              />
            </div>

            <div className="form-group">
          <label htmlFor="contact">Email / Phone Number *</label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            placeholder="Enter email or phone number"
          />
        </div>

            <div className="form-group">
              <label htmlFor="orgName">School / Organization Name *</label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                required
                placeholder="e.g. Green Hills Elementary"
              />
            </div>
          </>
        )}

        <button type="submit" className="primary-button login-button">
          {loginType === 'student'
            ? 'Login as Student'
            : loginType === 'organization'
            ? 'Login as Organization'
            : 'Login as Individual'}
        </button>
      </form>

      <div className="signup">
        
        <p>
          Don't have an account?{' '}
          <Link to="/signup" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#003220', cursor: 'pointer'}}>SignUp</span>
        </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
