'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getApiBase, apiFetch, cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { LoginModal } from '@/components/login-modal';

export function SiteHeader() {
  const [user, setUser] = useState<{ name: string; provider: string } | null>(
    null
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('authToken');
      const storedUser = sessionStorage.getItem('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    }
    // Set CSS variable for header offset (for anchor scroll alignment)
    const headerEl = document.querySelector('header');
    if (headerEl) {
      const h = headerEl.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-offset', `${h}px`);
    }
  }, []);

  const handleStartClick = () => {
    if (user) {
      navigate('/assessment');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    setLoggingOut(true);
    const run = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('authToken')
            : null;
        const storedUser =
          typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
        const userProvider = storedUser
          ? JSON.parse(storedUser).provider
          : null;

        // Call backend logout API
        try {
          await apiFetch(`/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: 'include',
            body: JSON.stringify({ reason: 'user_logout' }),
          });
        } catch (e) {
          // ignore; cleanup proceeds anyway
        }

        // Note: Kakao OAuth session is managed by Kakao's servers
        // We've added prompt=login parameter to the login URL to force account selection
        // This allows users to choose a different account on next login
        if (userProvider === 'kakao') {
          console.log(
            'Kakao user logged out. Next login will show account selection (prompt=login)'
          );
        }
      } catch (e) {
        console.warn('Logout API failed, proceeding with client cleanup:', e);
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
          sessionStorage.setItem('justLoggedOut', '1');
          setUser(null);
          // brief delay so the overlay is perceptible
          setTimeout(() => navigate('/'), 400);
        }
      }
    };
    run();
  };

  const handleLoginSuccess = (userData: { name: string; provider: string }) => {
    setUser(userData);
    setIsLoginModalOpen(false);
    navigate('/my');
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      // Already on home: prevent navigation and smooth scroll to top
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // From another route: pre-scroll current page so after navigation home is at top instantly
      window.scrollTo({ top: 0 });
      // allow navigation to proceed
    }
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="flex items-center gap-3"
          >
            <img
              src="/logo-icon.png"
              alt="국민체력지키미"
              className="h-12 w-12"
            />
            <span className="text-xl font-bold text-gray-900">
              국민체력지키미
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {isHome ? (
              // Home page: anchor links to sections
              !user ? (
                <>
                  <Link
                    to="/"
                    onClick={handleHomeClick}
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    홈
                  </Link>
                  <a
                    href="#how-it-works"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    사용 방법
                  </a>
                  <a
                    href="#features"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    서비스 소개
                  </a>
                  <a
                    href="#recipe"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    운동 레시피
                  </a>
                  <a
                    href="#start"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    지금 바로 시작
                  </a>
                </>
              ) : (
                // Logged in: show page links
                <>
                  <Link
                    to="/assessment"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    체력 측정
                  </Link>
                  <Link
                    to="/recipes"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    운동 레시피
                  </Link>
                  <Link
                    to="/community"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    동호회 찾기
                  </Link>
                  <Link
                    to="/facilities"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    시설 찾기
                  </Link>
                  <Link
                    to="/exercise"
                    className="relative text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    <span className="absolute -top-3 -right-4 text-[10px] font-bold text-red-500 animate-pulse">
                      NEW!
                    </span>
                    AI 코치
                  </Link>
                </>
              )
            ) : (
              // Other pages: always show page links if logged in
              user && (
                <>
                  <Link
                    to="/assessment"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    체력 측정
                  </Link>
                  <Link
                    to="/recipes"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    운동 레시피
                  </Link>
                  <Link
                    to="/community"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    동호회 찾기
                  </Link>
                  <Link
                    to="/facilities"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    시설 찾기
                  </Link>
                  <Link
                    to="/exercise"
                    className="relative text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    <span className="absolute -top-3 -right-4 text-[10px] font-bold text-red-500 animate-pulse">
                      NEW!
                    </span>
                    AI 코치
                  </Link>
                </>
              )
            )}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex gap-2 bg-transparent hover:bg-[#0074B7] hover:text-white hover:border-[#0074B7]"
                  >
                    <User className="h-4 w-4" />
                    {user.name}님
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      to="/my"
                      className="group flex cursor-pointer items-center hover:!bg-[#0074B7] hover:!text-white"
                    >
                      <User className="mr-2 h-4 w-4 group-hover:!text-white" />
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="group cursor-pointer hover:!bg-[#0074B7] hover:!text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4 group-hover:!text-white" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="hidden md:inline-flex bg-[#0074B7] text-white hover:bg-[#005a91]"
                onClick={handleStartClick}
              >
                시작하기
              </Button>
            )}
            {/* Mobile hamburger */}
            <Button
              variant="outline"
              className="md:hidden bg-white/70"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu (Dialog as right-side drawer) */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          showCloseButton={false}
          className="md:hidden !max-w-none !w-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none !border-0 p-0 bg-transparent shadow-none"
          aria-describedby={undefined}
        >
          {/* Accessible, visually hidden labels for screen readers */}
          <DialogTitle className="sr-only">모바일 메뉴</DialogTitle>
          <DialogDescription className="sr-only">
            사이트 네비게이션 링크
          </DialogDescription>

          {/* Backdrop */}
          <button
            aria-label="뒤로가기"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          {/* Drawer Panel (50% width) */}
          <div
            className={cn(
              'absolute right-0 top-0 z-10 h-full w-[80vw] bg-white shadow-2xl',
              'transition-transform duration-300 ease-out',
              mobileOpen ? 'translate-x-0' : 'translate-x-full'
            )}
            role="dialog"
            aria-label="모바일 메뉴"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-icon.png"
                  alt="국민체력지키미"
                  className="h-8 w-8"
                />
                <span className="text-base font-semibold text-gray-900">
                  국민체력지키미
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="닫기"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex h-[calc(100%-64px)] flex-col overflow-y-auto px-4 py-6">
              {user ? (
                <>
                  <Link
                    to="/assessment"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    체력 측정
                  </Link>
                  <Link
                    to="/recipes"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    운동 레시피
                  </Link>
                  <Link
                    to="/community"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    동호회 찾기
                  </Link>
                  <Link
                    to="/facilities"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    시설 찾기
                  </Link>
                  <Link
                    to="/exercise"
                    className="relative py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="absolute -top-1 left-16 text-[10px] font-bold text-red-500 animate-pulse">
                      NEW!
                    </span>
                    AI 코치
                  </Link>
                  <Link
                    to="/my"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    마이페이지
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="mt-4 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    홈
                  </Link>
                  <a
                    href="#how-it-works"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    사용 방법
                  </a>
                  <a
                    href="#features"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    서비스 소개
                  </a>
                  <a
                    href="#recipe"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    운동 레시피
                  </a>
                  <a
                    href="#start"
                    className="py-3 text-lg font-medium text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    지금 바로 시작
                  </a>
                  <Button
                    className="mt-6 bg-[#0074B7] text-white hover:bg-[#005a91]"
                    onClick={() => {
                      setMobileOpen(false);
                      handleStartClick();
                    }}
                  >
                    시작하기
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {loggingOut && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-5 text-center shadow-xl">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#0074B7]" />
            <div className="text-sm font-medium text-gray-900">
              로그아웃 중...
            </div>
          </div>
        </div>
      )}
    </>
  );
}
