"use client"
import React, { useState } from 'react';
import './style.css'; // Make sure this file has the correct styles for transitions
import SignIn from './signin';
import SignUp from './signup';

const SignInSignUpForm = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const toggleMode = () => {
    setIsSignUpMode((prevState) => !prevState);
  };

  return (
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {isSignUpMode ? <SignUp /> : <SignIn />}
        </div>
      </div>
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>
              Site officiel Dr Ahmed pour réservation de rendez-vous en ligne
            </p>
            <button className="btn transparent" id="sign-up-btn" onClick={toggleMode}>
              Sign up
            </button>
          </div>
          <img src='med2.png' className="image" alt="Sign Up" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>One of us?</h3>
            <p>
              Site officiel du cabinet Dr Ahmed
            </p>
            <button className="btn transparent" id="sign-in-btn" onClick={toggleMode}>
              Sign in
            </button>
          </div>
          <img src='med2.png' className="image" alt="Sign In" />
        </div>
      </div>
    </div>
  );
};

export default SignInSignUpForm;
