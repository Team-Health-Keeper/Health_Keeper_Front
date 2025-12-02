import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BackToTopButton } from './components/common/BackToTopButton';

import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Community from './pages/Community';
import Facilities from './pages/Facilities';
import MyPage from './pages/MyPage';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Results from './pages/Results';
import AuthCallback from './pages/AuthCallback';
import Exercise from './pages/Exercise';
import ExercisePlay from './pages/ExercisePlay';
import ExerciseResult from './pages/ExerciseResult';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/community" element={<Community />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/results" element={<Results />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/exercise/:id" element={<ExercisePlay />} />
        <Route path="/exercise/result" element={<ExerciseResult />} />
      </Routes>
      <BackToTopButton />
    </>
  );
}

export default App;
