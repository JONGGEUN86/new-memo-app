'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SupabaseSignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // user_profiles 테이블에서 사용자 확인
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password) // 실제로는 해시 비교해야 하지만 임시로
        .single()

      console.log('Login result:', { data, error })

      if (error) {
        console.error('Login error:', error)
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (data) {
        console.log('Login successful:', data)
        // 로그인 성공 시 세션 저장 (간단한 방식)
        localStorage.setItem('user', JSON.stringify(data))
        router.push('/')
        router.refresh()
      } else {
        setError('로그인 정보를 찾을 수 없습니다.')
      }
    } catch (err) {
      console.error('Unexpected login error:', err)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          계정에 로그인하여 메모를 관리하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
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
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 pt-6">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <div className="text-center text-sm">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              회원가입
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
