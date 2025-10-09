'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SupabaseSignUpForm() {
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // 비밀번호 검증 함수
  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return '비밀번호는 최소 8자 이상이어야 합니다.'
    }
    if (!hasUpperCase) {
      return '비밀번호는 대문자를 포함해야 합니다.'
    }
    if (!hasLowerCase) {
      return '비밀번호는 소문자를 포함해야 합니다.'
    }
    if (!hasNumbers) {
      return '비밀번호는 숫자를 포함해야 합니다.'
    }
    if (!hasSpecialChar) {
      return '비밀번호는 특수문자를 포함해야 합니다.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setIsLoading(false)
      return
    }

    try {
      // 닉네임 중복 검사
      const { data: existingUsers } = await supabase
        .from('user_profiles')
        .select('nickname')
        .eq('nickname', nickname)
        .limit(1)

      if (existingUsers && existingUsers.length > 0) {
        setError('이미 사용 중인 닉네임입니다.')
        setIsLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
            nickname: nickname,
          },
          emailRedirectTo: `${window.location.origin}/auth/signin`
        }
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/auth/signin')
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>
          새 계정을 생성하여 메모를 관리하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임 *</Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">이름 (선택사항)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="실제 이름 (선택사항)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상, 대소문자, 숫자, 특수문자 포함"
              required
            />
            <div className="text-xs text-muted-foreground">
              • 최소 8자 이상<br/>
              • 대문자, 소문자, 숫자, 특수문자 포함
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Button>
          <div className="text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline">
              로그인
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
