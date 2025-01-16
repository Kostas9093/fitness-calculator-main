// src/components/ProgressDisplay.js
import React from 'react';

const ProgressDisplay = ({ progress }) => {
  if (!progress) return null;

  const {
    weightDiff,
    fatDiff,
    muscleDiff,
    waterDiff,
    oldFatKilos,
    newFatKilos,
    oldMuscleKilos,
    newMuscleKilos
  } = progress;

  const fatKilosDiff = (newFatKilos - oldFatKilos).toFixed(2);
  const muscleKilosDiff = (newMuscleKilos - oldMuscleKilos).toFixed(2);

  return (<></>);
};

export default ProgressDisplay;
