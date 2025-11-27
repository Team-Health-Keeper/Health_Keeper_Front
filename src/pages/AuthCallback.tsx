"use client"

import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

export default function AuthCallback() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get("token")
    const name = params.get("name")

    if (token) {
      // Store token for authenticated state
      sessionStorage.setItem("authToken", token)

      // Optionally, store a minimal user object if needed by existing UI
      const userData = { name: name || "사용자", provider: "kakao" }
      sessionStorage.setItem("user", JSON.stringify(userData))

      // Navigate to My Page after successful login
      navigate("/my", { replace: true })
    } else {
      // No token provided; navigate home
      navigate("/", { replace: true })
    }
  }, [location.search, navigate])

  return null
}
