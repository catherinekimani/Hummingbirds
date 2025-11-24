import React, { useState } from 'react';
import './SignupPage.css';
import { Link, useNavigate} from 'react-router-dom';



function SignupPage() {
  const [accountType, setAccountType] = useState('individual');
  
 
  const [formData, setFormData] = useState({
    email: '',
    phonenumber: '',
    organizationName: '',
    description: '',
    
  });

   const navigate = useNavigate();


 
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

  console.log('Account Type:', accountType);
  console.log('Form Data:', formData);

  // Here you can do API call / validation first
  // After successful registration, redirect:

  if (accountType === 'organization') {
    console.log(`Organization ${formData.organizationName} registering.`);
    navigate('/AdminDashboard'); // <-- redirect organization
  } else {
    console.log('Individual registering.');
    navigate('/dashboard'); // <-- redirect individual
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
        
        {/* for organization */}
       
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
  
  {/* For individuals */}
{accountType === 'individual' && (
  <>
   
    <div className="form-group">
      <label htmlFor="fullName">Full Name *</label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        required
        placeholder="Enter your full name"
      />
    </div>

    <div className="form-group">
      <label htmlFor="username">Username *</label>
      <input
        type="text"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
        placeholder="Enter a unique username"
      />
    </div>
  </>
)}

{/* For all */}
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


        <button type="submit" className="primary-button signup-button">
          {accountType === 'organization' ? 'Register Organization ' : 'Create Account'}
        </button>
      </form>
      <div className='Login'>
  <p>
    Already have an account?{' '}
    <Link to="/login" style={{ textDecoration: 'none' }}>
    <span style={{ color: '#003220' }}>Login</span>
    </Link>
  </p>
</div>
    </div>
  );
}

export default SignupPage;