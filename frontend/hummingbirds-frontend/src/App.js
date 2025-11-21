// src/App.js - Handles Navigation Logic
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import HomePage from './Pages/HomePage'; 
import SignupPage from './Pages/SignupPage'; 
import LoginPage from './Pages/LoginPage';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        
          <Route path="/" element={<HomePage />} /> 
          
          
          <Route path="/signup" element={<SignupPage />} /> 


          <Route path="/login" element={<LoginPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;



