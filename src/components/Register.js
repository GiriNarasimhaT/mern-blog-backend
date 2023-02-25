import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from "../config";
import { Form, Button } from "react-bootstrap";
import Loading from "./Loading";

function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpass, setConfirmpass] = useState('');
  const [redirect, setRedirect] = useState(false);

  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmpassError, setConfirmpassError] = useState(null);

  const [message, setMessage] = useState('');
  const [type, setType] = useState(false);

  useEffect(() => {
    if (message) {
      if (type) {
        toast.success(message);
      } else {
        toast.error(message);
      }
      setMessage('');
    }
  }, [message]);

  function validateForm() {
    let valid = true;

    if (!username.trim()) {
      setUsernameError("Please enter your username");
      valid = false;
    } else if (!/^[A-Za-z]/.test(username)) {
      setUsernameError("Username must start with a letter");
      valid = false;
    }else if (username.length < 8) {
      setUsernameError("Username must be at least 8 characters long");
      valid = false;
    } else if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(username)) {
      setUsernameError("Only letters, numbers and underscores are allowed");
      valid = false;
    } else {
      setUsernameError(null);
    }

    if (!email.trim()) {
      setEmailError("Please enter your email");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!confirmpass.trim()) {
      setConfirmpassError("Please confirm your password");
      valid = false;
    } else if (confirmpass !== password) {
      setConfirmpassError("Passwords do not match");
      valid = false;
    } else {
      setConfirmpassError(null);
    }

    return valid;
  }

  async function register(e) {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const responseData = await response.json(); // parse JSON response
      setIsLoading(false);
      setRedirect(true);
      setMessage(responseData.message || "Registered successfully");
      setType(true);
    } else {
      const errorData = await response.json(); // parse JSON error response
      setIsLoading(false);
      setMessage(errorData.error || "Registration failed");
      setType(false);
    }    
  }

  if (isLoading) {
    return <Loading />;
  }

  if (redirect) {
    return <Navigate to="/login" />
  }

  return (
    <div className="register">
      <h1>Register</h1>
      <Form onSubmit={register} className="text-left">
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isInvalid={usernameError}
          />
          <Form.Control.Feedback type="invalid">
            {usernameError}
          </Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={emailError}
          />
          <Form.Control.Feedback type="invalid">
            {emailError}
          </Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={passwordError}
          />
          <Form.Control.Feedback type="invalid">
            {passwordError}
          </Form.Control.Feedback>
        </Form.Group>
  
        <Form.Group controlId="formBasicConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            value={confirmpass}
            onChange={(e) => setConfirmpass(e.target.value)}
            isInvalid={confirmpassError}
          />
          <Form.Control.Feedback type="invalid">
            {confirmpassError}
          </Form.Control.Feedback>
        </Form.Group>
  
        <Button variant="primary" type="submit">
          Register
        </Button>
      </Form>
    </div>
  );
}

export default Register;