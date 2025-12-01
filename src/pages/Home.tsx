"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { LoginModal } from "@/components/login-modal"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useNavigate } from "react-router-dom"
import { Hero } from "@/components/home/Hero"
import { HowItWorks } from "@/components/home/HowItWorks"
import { Features } from "@/components/home/Features"
import { RecipePreview } from "@/components/home/RecipePreview"
import { StartCTA } from "@/components/home/StartCTA"

export default function Home() {
  const navigate = useNavigate()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [showLogoutNotice, setShowLogoutNotice] = useState(false)
  const [logoutNoticeLeaving, setLogoutNoticeLeaving] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem("authToken")
    const storedUser = sessionStorage.getItem("user")
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    } else if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    // show one-time logout notice
    const justLoggedOut = sessionStorage.getItem("justLoggedOut")
    if (justLoggedOut) {
      sessionStorage.removeItem("justLoggedOut")
      setShowLogoutNotice(true)
    }
  }, [])

  // Auto-dismiss with smooth fade-out (StrictMode-safe): show -> start leaving -> unmount
  useEffect(() => {
    if (!showLogoutNotice) return
    setLogoutNoticeLeaving(false)
    const t1 = setTimeout(() => setLogoutNoticeLeaving(true), 2000)
    const t2 = setTimeout(() => setShowLogoutNotice(false), 2600) // match CSS duration ~300-600ms
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [showLogoutNotice])

  // Show back-to-top button after scrolling down a bit
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setShowBackToTop(y > 400)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target) // Stop observing once visible
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    // Observe all sections with fade-in-section class
    const sections = document.querySelectorAll(".fade-in-section")
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const handleLoginSuccess = (loginData: { provider: string; name: string }) => {
    const userData = { name: loginData.name }
    setUser(userData)
    sessionStorage.setItem("user", JSON.stringify(userData))
    setLoginModalOpen(false)
    navigate("/my")
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  const handleGetStarted = () => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
    const userStr = typeof window !== "undefined" ? sessionStorage.getItem("user") : null
    if (token || userStr) {
      navigate("/assessment")
    } else {
      setLoginModalOpen(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* One-time logout notice */}
      {showLogoutNotice && (
        <div
          className={`pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 transition-all duration-300 ${logoutNoticeLeaving ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"}`}
        >
          <div className="pointer-events-auto rounded-full bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg">
            성공적으로 로그아웃되었습니다.
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="min-h-screen bg-white">
          <Hero onGetStarted={handleGetStarted} onGoRecipes={() => navigate('/recipes')} />

          <HowItWorks />

          <Features />

          <RecipePreview onGetStarted={handleGetStarted} />

          <StartCTA onGetStarted={handleGetStarted} />

          {/* Unified Footer */}
          <SiteFooter />

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              type="button"
              aria-label="맨 위로 이동"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0074B7] text-white shadow-lg transition hover:bg-[#005a91] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0074B7] cursor-pointer"
           >
              <ArrowUp className="h-5 w-5" />
            </button>
          )}

          {loginModalOpen && (
            <LoginModal
              isOpen={loginModalOpen}
              onClose={() => setLoginModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </div>
      </main>
    </div>
  )
}