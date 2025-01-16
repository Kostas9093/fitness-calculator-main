import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import MeasurementForm from './components/MeasurementForm';
import ProgressDisplay from './components/ProgressDisplay';

function App() {
  const [progress, setProgress] = useState(null);
  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // Token state for auth
  const [message, setMessage] = useState('');

  // Handle login
  const loginUser = (token) => {
    setIsAuthenticated(true);
    setToken(token);
    localStorage.setItem('token', token); // Save token to localStorage
    setMessage('Login successful!');
  };

  // Handle logout
  const logoutUser = () => {
    setIsAuthenticated(false);
    setToken('');
    localStorage.removeItem('token');
    setMessage('Logged out successfully.');
  };

  // Calculate progress based on measurements
  const calculateProgress = (oldMeasurements, newMeasurements) => {
    const oldFatKilos = (oldMeasurements.weight * oldMeasurements.fat) / 100;
    const newFatKilos = (newMeasurements.weight * newMeasurements.fat) / 100;
    const oldMuscleKilos = (oldMeasurements.weight * oldMeasurements.muscle) / 100;
    const newMuscleKilos = (newMeasurements.weight * newMeasurements.muscle) / 100;

    const progress = {
      weightDiff: newMeasurements.weight - oldMeasurements.weight,
      fatDiff: newMeasurements.fat - oldMeasurements.fat,
      muscleDiff: newMeasurements.muscle - oldMeasurements.muscle,
      waterDiff: newMeasurements.water - oldMeasurements.water,
      fatKilosDiff: newFatKilos - oldFatKilos,
      muscleKilosDiff: newMuscleKilos - oldMuscleKilos,
    };

    setProgress(progress);

    // Update measurement history in localStorage
    const newHistoryEntry = {
      date: new Date().toISOString(),
      measurements: newMeasurements,
    };

    const updatedHistory = [...measurementHistory, newHistoryEntry];
    setMeasurementHistory(updatedHistory);
    localStorage.setItem('measurementHistory', JSON.stringify(updatedHistory));

    // Update the old measurements to the new ones
    localStorage.setItem('oldMeasurements', JSON.stringify(newMeasurements));
  };

  // Load old measurements and history from localStorage
  useEffect(() => {
    const savedMeasurements = JSON.parse(localStorage.getItem('oldMeasurements'));
    if (savedMeasurements) {
      setProgress({
        weightDiff: 0,
        fatDiff: 0,
        muscleDiff: 0,
        waterDiff: 0,
        oldFatKilos: (savedMeasurements.weight * savedMeasurements.fat) / 100,
        newFatKilos: 0,
        oldMuscleKilos: (savedMeasurements.weight * savedMeasurements.muscle) / 100,
        newMuscleKilos: 0,
      });
    }

    const savedHistory = JSON.parse(localStorage.getItem('measurementHistory'));
    if (savedHistory) {
      setMeasurementHistory(savedHistory);
    }
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  return (
    <Router>
      <div className="App">
        <h1>Fitness Progress Tracker</h1>

        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={loginUser} />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <MeasurementForm onCalculate={calculateProgress} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/progress"
            element={
              isAuthenticated ? (
                <ProgressDisplay progress={progress} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Redirect to home if already logged in */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>

        {/* Conditional Logout button */}
        {isAuthenticated && <button id="logout"  onClick={logoutUser}>Logout</button>}
      </div>
    </Router>
  );
}

export default App;

