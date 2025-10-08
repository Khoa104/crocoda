// src/pages/Signup.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";


function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(''); // Tùy chọn
  const [fullName, setFullName] = useState(''); // Tùy chọn
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { signUp, loading: authLoading  } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/signup", {
        email,
        password,
      });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert("Signup failed");
    }
  };

  return (

    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={formLoading} />
        </div>
        <div>
          <label htmlFor="username">Username (Optional):</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={formLoading} />
        </div>
        <div>
          <label htmlFor="fullName">Full Name:</label>
          <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={formLoading} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={formLoading} />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={formLoading} />
        </div>
        
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}
        <button type="submit" disabled={formLoading || authLoading}>
          {formLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
    // <div>
    //   <h2>Signup</h2>
    //   <form onSubmit={handleSignup}>
    //     <input
    //       type="email"
    //       placeholder="Email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       required
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       required
    //     />
    //     <button type="submit">Signup</button>
    //   </form>
    // </div>
  );
}

export default Signup;
