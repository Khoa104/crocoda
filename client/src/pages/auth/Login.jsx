// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { loginUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    setFormLoading(true);
    e.preventDefault();
    try {
      const modules = await loginUser(email, password);
      console.log(modules)
      if(modules.length === 1) {
        localStorage.setItem("selectedModule", modules[0]);
        navigate(`/${modules[0].toLowerCase()}/home`);
      }
      else {
        navigate('/modules')
      }
    } catch (error) {
      setErrorMsg("Invalid credentials");
      console.log(error)
    }
    setFormLoading(false);
  };
  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={formLoading}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={formLoading}
          />
        </div>
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <button type="submit" disabled={formLoading || authLoading}>
          {formLoading || authLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>

    // <div>
    //   <h2>Login</h2>
    //   <form onSubmit={handleSubmit}>
    //     <input
    //       type="email"
    //       placeholder="Email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //     />
    //     <button type="submit">Login</button>
    //   </form>
    // </div>
  );
}

export default Login;
