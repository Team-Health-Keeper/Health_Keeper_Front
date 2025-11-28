import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Assessment from "./pages/Assessment";
import Community from "./pages/Community";
import Facilities from "./pages/Facilities";
import MyPage from "./pages/MyPage";
import MyRecipes from "./pages/MyRecipes";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Results from "./pages/Results";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/community" element={<Community />} />
      <Route path="/facilities" element={<Facilities />} />
      <Route path="/my" element={<MyPage />} />
      <Route path="/my/recipes" element={<MyRecipes />} />
      <Route path="/recipes" element={<Recipes />} />
      {/* Temporary static route for testing specific recipe detail without :id */}
      <Route path="/recipes/lower-body-strength" element={<RecipeDetail />} />
      <Route path="/recipes/:id" element={<RecipeDetail />} />
      <Route path="/results" element={<Results />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  );
}

export default App;
