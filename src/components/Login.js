import { useState, useContext, useEffect } from "react";
import { UserContext } from '../UserContext'
import { Navigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_URL from "../config";
import { Form, Button } from "react-bootstrap";
import Loading from "./Loading";

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [message, setMessage] = useState('');
  const [type, setType] = useState(false);

  useEffect(() => {
    if (message) {
      if (type)
        toast.success(message);
      else {
        toast.error(message);
      }
      setMessage('');
    }
  }, [message]);

  function validateForm() {
    let valid = true;

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

    return valid;
  }

  async function login(e) {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Content-Type': 'application/json',
    },
      credentials: 'include'
    });

    if (response.ok) {
      response.json().then(userInfo => {
        setIsLoading(false);
        setUserInfo(userInfo);
        setRedirect(true);
        setMessage("Login Successful");
        setType(true);
      });
    } else {
      response.json().then(mes => {
        const jsonString = JSON.stringify(mes);
        const cleanString = jsonString.replace(/["']/g, "");
        setIsLoading(false);
        setMessage(cleanString);
        setType(false);
      });
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  if (redirect) {
    return <Navigate to="/" />
  }

  return (
    <Form className="login" onSubmit={login}>
      <h1>Login</h1>
      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} isInvalid={emailError} />
        <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} isInvalid={passwordError} />
        <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
      </Form.Group>

      <Button variant="primary" type="submit">Login</Button>
    </Form>
  );
}

export default Login;
