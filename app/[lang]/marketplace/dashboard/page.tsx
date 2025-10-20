"use client"

import { useParams } from "next/navigation"
import { ClientOnly } from "@/components/client-only"
import { AuthHeader } from "@/components/auth-header"
import { AuthFooter } from "@/components/auth-footer"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

function MarketplaceDashboardContent() {
  const params = useParams()
  const lang = (params?.lang as string) || "en"
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('dashboard_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setShowAuthModal(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simple authentication check (you can replace with your actual auth logic)
      if (username === "admin" && password === "dashboard2025") {
        localStorage.setItem('dashboard_authenticated', 'true')
        setIsAuthenticated(true)
        setShowAuthModal(false)
      } else {
        setError(lang === "rw" ? "Umwirondoro n'ijambo ry'ibanga ntabwo byemewe" :
                lang === "fr" ? "Nom d'utilisateur ou mot de passe incorrect" :
                "Invalid username or password")
      }
    } catch (err) {
      setError(lang === "rw" ? "Ikosa ryabaye" :
              lang === "fr" ? "Une erreur s'est produite" :
              "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('dashboard_authenticated')
    setIsAuthenticated(false)
    setShowAuthModal(true)
    setUsername("")
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Authentication Modal */}
        {!isAuthenticated && showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-gray-200 w-full max-w-md p-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {lang === "rw" ? "Urupapuro rw'Isoko" :
                   lang === "fr" ? "Tableau de Bord du Marché" :
                   "Marketplace Dashboard"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {lang === "rw" ? "Injira kugira ngo ube ukoze ubu bwoba" :
                   lang === "fr" ? "Connectez-vous pour accéder à ce tableau de bord" :
                   "Please sign in to access this dashboard"}
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">
                    {lang === "rw" ? "Amazina yo gukoresha" :
                     lang === "fr" ? "Nom d'utilisateur" :
                     "Username"}
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === "rw" ? "Injiza amazina yo gukoresha" :
                                 lang === "fr" ? "Entrez votre nom d'utilisateur" :
                                 "Enter your username"}
                    required
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {lang === "rw" ? "Ijambo ry'ibanga" :
                     lang === "fr" ? "Mot de passe" :
                     "Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={lang === "rw" ? "Injiza ijambo ry'ibanga" :
                                       lang === "fr" ? "Entrez votre mot de passe" :
                                       "Enter your password"}
                      required
                      className="w-full pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {lang === "rw" ? "Gutangira..." :
                       lang === "fr" ? "Connexion..." :
                       "Signing in..."}
                    </div>
                  ) : (
                    lang === "rw" ? "Injira" :
                    lang === "fr" ? "Se connecter" :
                    "Sign In"
                  )}
                </Button>
              </form>

            </div>
          </div>
        )}

        {/* Dashboard Content - Only show when authenticated */}
        {isAuthenticated && (
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {lang === "rw" ? "Urupapuro rw'Isoko" : 
                     lang === "fr" ? "Tableau de Bord du Marché" : 
                     "Marketplace Dashboard"}
                  </h1>
                  <p className="text-gray-600">
                    {lang === "rw" ? "Reba amakuru y'isoko ryacu" :
                     lang === "fr" ? "Visualisez les données de notre marché" :
                     "View our marketplace analytics and insights"}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {lang === "rw" ? "Gusohoka" :
                   lang === "fr" ? "Se déconnecter" :
                   "Logout"}
                </Button>
              </div>
            </div>

          {/* PowerBI Dashboard */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {lang === "rw" ? "Amakuru y'Isoko" :
                 lang === "fr" ? "Données du Marché" :
                 "Marketplace Analytics"}
              </h2>
              <p className="text-gray-600 mt-1">
                {lang === "rw" ? "Amakuru y'ubucuruzi n'ibikorwa by'isoko" :
                 lang === "fr" ? "Analyses des ventes et performances du marché" :
                 "Sales data and marketplace performance metrics"}
              </p>
            </div>
            
            <div className="p-6">
              <div className="relative w-full" style={{ paddingBottom: '62.25%' }}>
                <iframe
                  title="Gemurai Dashboard"
                  width="100%"
                  height="100%"
                  src="https://app.powerbi.com/view?r=eyJrIjoiYTNjMzMzNWMtZmU3OS00MzNjLTk1NTktZDFjNzJjYjMxNDBlIiwidCI6IjVkNzk4MGMzLTRhNDctNDM2Ni1iNmRkLWE1NjdlMjExOWVlYyJ9"
                  frameBorder="0"
                  allowFullScreen={true}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  style={{ minHeight: '500px' }}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lang === "rw" ? "Ubwoba bw'Ubucuruzi" :
                 lang === "fr" ? "Volume des Ventes" :
                 "Sales Volume"}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === "rw" ? "Reba ubwoba bw'ubucuruzi bwo mu gihe cyose" :
                 lang === "fr" ? "Consultez le volume des ventes en temps réel" :
                 "Monitor real-time sales performance"}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lang === "rw" ? "Abakoresha" :
                 lang === "fr" ? "Utilisateurs" :
                 "Users"}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === "rw" ? "Reba abakoresha b'isoko n'ibikorwa byabo" :
                 lang === "fr" ? "Analysez l'activité des utilisateurs" :
                 "Track user engagement and activity"}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {lang === "rw" ? "Ibicuruzwa" :
                 lang === "fr" ? "Produits" :
                 "Products"}
              </h3>
              <p className="text-gray-600 text-sm">
                {lang === "rw" ? "Reba ibicuruzwa byose n'ibikorwa byabyo" :
                 lang === "fr" ? "Surveillez les performances des produits" :
                 "Monitor product performance and trends"}
              </p>
            </div>
          </div>
          </div>
        )}
      </div>

      <AuthFooter />
    </div>
  )
}

export default function MarketplaceDashboardPage() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">
            {typeof window !== 'undefined' && window.location.pathname.includes('/rw') ? 'Gutangira...' : 'Loading...'}
          </p>
        </div>
      </div>
    }>
      <MarketplaceDashboardContent />
    </ClientOnly>
  )
}
