"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"
import { LoginModal } from "@/components/login-modal"

export function SiteHeader() {
  const [user, setUser] = useState<{ name: string; provider: string } | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("authToken")
      const storedUser = sessionStorage.getItem("user")
      if (token && storedUser) {
        setUser(JSON.parse(storedUser))
      } else if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
    }
    // Set CSS variable for header offset (for anchor scroll alignment)
    const headerEl = document.querySelector('header')
    if (headerEl) {
      const h = headerEl.getBoundingClientRect().height
      document.documentElement.style.setProperty('--header-offset', `${h}px`)
    }
  }, [])

  const handleStartClick = () => {
    if (user) {
      navigate("/assessment")
    } else {
      setIsLoginModalOpen(true)
    }
  }

  const handleLogout = () => {
    const run = async () => {
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
        await fetch("http://localhost:3001/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ reason: "user_logout" }),
        })
      } catch (e) {
        console.warn("Logout API failed, proceeding with client cleanup:", e)
      } finally {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("user")
          sessionStorage.removeItem("authToken")
          setUser(null)
          navigate("/")
        }
      }
    }
    run()
  }

  const handleLoginSuccess = (userData: { name: string; provider: string }) => {
    setUser(userData)
    setIsLoginModalOpen(false)
    navigate("/my")
  }

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const isHome = location.pathname === "/"

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="국민체력지키미" className="h-12 w-12" />
            <span className="text-xl font-bold text-gray-900">국민체력지키미</span>
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
                  <a href="#start" className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]">
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
                    커뮤니티
                  </Link>
                  <Link
                    to="/facilities"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    시설 찾기
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
                    커뮤니티
                  </Link>
                  <Link
                    to="/facilities"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#0074B7]"
                  >
                    시설 찾기
                  </Link>
                </>
              )
            )}
          </nav>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent hover:bg-[#0074B7] hover:text-white hover:border-[#0074B7]"
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
            <Button className="bg-[#0074B7] text-white hover:bg-[#005a91]" onClick={handleStartClick}>
              시작하기
            </Button>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}