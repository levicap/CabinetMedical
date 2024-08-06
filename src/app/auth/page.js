"use client"
import React, { useState } from 'react';
import './style.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faGoogle, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faUser, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';





const SignInSignUpForm = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const toggleMode = () => {
    setIsSignUpMode((prevState) => !prevState);
  };

  return (
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <form className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <FontAwesomeIcon className='Icon'  icon={faUser} />
              <input type="text" placeholder="Username" />
            </div>
            <div className="input-field">
              <FontAwesomeIcon className='Icon' icon={faLock} />

              
              
            </div>
            <input type="submit" value="Login" className="btn solid" />
            <p className="social-text">Or Sign in with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faGoogle} />

              </a>
              
              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faFacebookF} />

              </a>
              
            </div>
          </form>
  
          <form className="sign-up-form">
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <FontAwesomeIcon className='Icon' icon={faUser} />

              <input type="text" placeholder="Username" />
            </div>
            <div className="input-field">
              <FontAwesomeIcon className='Icon' icon={faEnvelope} />

              <input type="email" placeholder="Email" />
            </div>
            <div className="input-field">
              <FontAwesomeIcon className='Icon' icon={faLock} />
              

            </div>
            <input type="submit" className="btn" value="Sign up" />
            <p className="social-text">Or Sign up with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
              <FontAwesomeIcon icon={faFacebookF} />

              </a>
             


              <a href="#" className="social-icon">
                <FontAwesomeIcon icon={faGoogle} />

              </a>
            
            </div>
          </form>
        </div>
      </div>
  
      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>New here?</h3>
            <p>
              place where food lovers can share their recipes, ideas and experiences.

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
              place where food lovers can share their recipes, ideas and experiences.
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