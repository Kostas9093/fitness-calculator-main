import React, { useState, useEffect } from 'react';
import '../App.css';
const ProgressDisplay = ({ progress }) => {
  if (!progress) return null;

  const {
    weightDiff,
    fatDiff,
    muscleDiff,
    waterDiff,
    musleKilosDiff,
    fatKilosDiff,
  } = progress;

  return (
    <div className="new">
      <h2>Progress Results</h2>
      <p>Weight Change: {weightDiff >= 0 ? `You gained ${weightDiff} kg` : `You lost ${Math.abs(weightDiff).toFixed(2)} kg`}</p>
      <p>Fat Mass Change: {fatDiff >= 0 ? `You gained ${fatDiff} % which is ${fatKilosDiff} in kg` : `You lost ${Math.abs(fatDiff).toFixed(2)} % witch is ${Math.abs(fatKilosDiff).toFixed(2)} in kg`} </p>
      <p>Muscle Mass Change: {muscleDiff >= 0 ? `You gained ${muscleDiff} % which is ${musleKilosDiff} in kg` : `You lost ${Math.abs(muscleDiff).toFixed(2)} % which is ${Math.abs(musleKilosDiff).toFixed(2)} in kg`} </p>
      <p>Water Change: {waterDiff >=0 ? ` ${waterDiff}%` : `${waterDiff}%`} </p>
    </div>
  );
};

const MeasurementForm = () => {
  const [oldMeasurements, setOldMeasurements] = useState({
    weight: '',
    fat: '',
    muscle: '',
    water: ''
  });

  const [newMeasurements, setNewMeasurements] = useState({
    weight: '',
    fat: '',
    muscle: '',
    water: ''
  });

  const [progress, setProgress] = useState(null);
  const [measurementHistory, setMeasurementHistory] = useState([]);

  useEffect(() => {
    const savedOldMeasurements = JSON.parse(localStorage.getItem('oldMeasurements'));
    if (savedOldMeasurements) {
      setOldMeasurements(savedOldMeasurements);
    }

    const savedMeasurementHistory = JSON.parse(localStorage.getItem('measurementHistory'));
    if (savedMeasurementHistory) {
      setMeasurementHistory(savedMeasurementHistory);
    }
  }, []);

  const handleChange = (e, type, isOld = true) => {
    const { name, value } = e.target;
    if (isOld) {
      setOldMeasurements(prevState => ({
        ...prevState,
        [name]: value
      }));
    } else {
      setNewMeasurements(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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
      musleKilosDiff: newMuscleKilos - oldMuscleKilos
    };

    setProgress(progress);

    // Update the measurement history
    const newHistoryEntry = {
      date: new Date().toISOString(),
      measurements: newMeasurements
    };

    const updatedHistory = [...measurementHistory, newHistoryEntry];
    setMeasurementHistory(updatedHistory);
    localStorage.setItem('measurementHistory', JSON.stringify(updatedHistory));

    // Update the old measurements to the new ones
    localStorage.setItem('oldMeasurements', JSON.stringify(newMeasurements));
  };

  // Function to handle clearing the last entry from history
  const handleClearHistory = () => {
    if (measurementHistory.length > 0) {
      const updatedHistory = measurementHistory.slice(0, -1); // Remove the last entry
      setMeasurementHistory(updatedHistory);
      localStorage.setItem('measurementHistory', JSON.stringify(updatedHistory));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Old Measurements</h2>
        <div>
          <label>Weight (kg):</label>
          <input
            type="number"
            placeholder="Enter Your Previous Weight in kg"
            name="weight"
            value={oldMeasurements.weight}
            onChange={(e) => handleChange(e, 'weight')}
          />
        </div>
        <div>
          <label>Fat Mass (%):</label>
          <input
            type="number"
            placeholder="Enter Your Previous Fat Mass in %"
            name="fat"
            value={oldMeasurements.fat}
            onChange={(e) => handleChange(e, 'fat')}
          />
        </div>
        <div>
          <label>Muscle Mass (%):</label>
          <input
            type="number"
            placeholder="Enter Your Previous Muscle Mass in %"
            name="muscle"
            value={oldMeasurements.muscle}
            onChange={(e) => handleChange(e, 'muscle')}
          />
        </div>
        <div>
          <label>Water (%):</label>
          <input
            type="number"
            placeholder="Enter Your Previous Water in %"
            name="water"
            value={oldMeasurements.water}
            onChange={(e) => handleChange(e, 'water')}
          />
        </div>

        <h2>New Measurements</h2>
        <div>
          <label>Weight (kg):</label>
          <input
            type="number"
            placeholder="Enter Your Current Weight in kg"
            name="weight"
            value={newMeasurements.weight}
            onChange={(e) => handleChange(e, 'weight', false)}
          />
        </div>
        <div>
          <label>Fat Mass (%):</label>
          <input
            type="number"
            placeholder="Enter Your Current Fat Mass in %"
            name="fat"
            value={newMeasurements.fat}
            onChange={(e) => handleChange(e, 'fat', false)}
          />
        </div>
        <div>
          <label>Muscle Mass (%):</label>
          <input
            type="number"
            placeholder="Enter Your Current Muscle Mass %"
            name="muscle"
            value={newMeasurements.muscle}
            onChange={(e) => handleChange(e, 'muscle', false)}
          />
        </div>
        <div>
          <label>Water (%):</label>
          <input
            type="number"
            placeholder="Enter Your Current Water in %"
            name="water"
            value={newMeasurements.water}
            onChange={(e) => handleChange(e, 'water', false)}
          />
        </div>
        <button type="submit">Compare</button>
      </form>

      <ProgressDisplay progress={progress} />

      <h2 id="history">Measurement History</h2>
      <ul>
        {measurementHistory.map((entry, index) => (
          <li key={index}>
            {entry.date}: Weight: {entry.measurements.weight}kg, Fat: {entry.measurements.fat}%, Muscle: {entry.measurements.muscle}%, Water: {entry.measurements.water}%
          </li>
        ))}
      </ul>

      <button id="clearhistory" onClick={handleClearHistory}>Clear Last Entry</button>
    </div>
  );
};

export default MeasurementForm;
