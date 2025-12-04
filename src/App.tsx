import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { BackToTopButton } from './components/common/BackToTopButton';
import { LoginModal } from './components/login-modal';

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
import ThreeByThreeTestPage from './pages/ThreeByThreeTest';
import TWallTestPage from './pages/TWallTest';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  // 공개 경로: 운동 레시피, 동호회 찾기, 시설 찾기
  const publicPaths = new Set<string>(['/recipes', '/community', '/facilities']);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    const path = location.pathname;

    // 레시피 상세도 공개 처리
    const isRecipeDetail = path.startsWith('/recipes/');
    const isPublic = publicPaths.has(path) || isRecipeDetail || path === '/';

    if (!token && !isPublic) {
      // 보호 경로 접근 차단: 메인으로 보내고 로그인 모달 오픈
      if (path !== '/') navigate('/');
      setLoginOpen(true);
    }
  }, [location.pathname, navigate]);

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
        <Route path="/three-grid" element={<ThreeByThreeTestPage />} />
        <Route path="/twall" element={<TWallTestPage />} />
      </Routes>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <BackToTopButton />
    </>
  );
}

export default App;