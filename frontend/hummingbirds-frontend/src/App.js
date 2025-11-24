// src/App.js - Handles Navigation Logic
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import HomePage from './Pages/HomePage'; 
import SignupPage from './Pages/SignupPage'; 
import LoginPage from './Pages/LoginPage';
import Dashboard from "./Pages/Dashboard";
import AdminDashboard from './Pages/AdminDashboard';

import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
        
          <Route path="/" element={<HomePage />} /> 
          
          
          <Route path="/signup" element={<SignupPage />} /> 


          <Route path="/login" element={<LoginPage />} /> 
         
         <Route path="/dashboard" element={<Dashboard />} />

         <Route path="/AdminDashboard" element={<AdminDashboard />} /> {/* organization */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;



