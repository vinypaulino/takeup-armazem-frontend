"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      return
    }

    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      // Navigate to dashboard after successful login
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-3xl border-0">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo-freelance-cotton.jpeg"
                alt="FreeLance Cotton Logo"
                width={96}
                height={96}
                className="object-contain rounded-lg shadow-sm"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Freelance Cotton</h1>
            <p className="text-gray-600 text-lg">Sistema de Gestão de Armazém</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Nome de Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu nome"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                "Entrando..."
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
