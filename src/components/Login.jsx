import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = 'http://localhost:3000';

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
            setToken(response.data.token);
            setMessage('Login successful!');
            navigate('/');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div id="logindiv">
            <h2 id="log">Login</h2>
            <p>{message}</p>
            <form id="logi" onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
               <button id="loginb" type="submit">Login</button>
            </form>
           
            <p id="registerm">
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
