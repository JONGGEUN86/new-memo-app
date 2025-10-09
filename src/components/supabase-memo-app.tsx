'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Memo } from '@/types/memo'
import { Plus, LogOut, Edit, Trash2, Save, X } from 'lucide-react'

export default function SupabaseMemoApp() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string; nickname?: string } } | null>(null)
  const [memos, setMemos] = useState<Memo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ title: '', content: '' })

  // 안전한 날짜 파싱 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '날짜 정보 없음'
      }
      return date.toLocaleString('ko-KR')
    } catch (error) {
      console.error('Date parsing error:', error)
      return '날짜 정보 없음'
    }
  }

  // 사용자 정보 가져오기
  useEffect(() => {
    const getUser = () => {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        setUser(user)
      } else {
        router.push('/auth/signin')
      }
    }
    getUser()
  }, [router])

  // 메모 목록 가져오기
  const fetchMemos = useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching memos:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // 모든 에러에 대해 빈 배열로 설정 (임시 해결책)
        console.log('Setting empty memos array due to error')
        setMemos([])
      } else {
        console.log('Memos fetched successfully:', data)
        // 시간 필드 매핑 수정
        const mappedMemos = (data || []).map(memo => {
          console.log('Raw memo data:', memo)
          return {
            ...memo,
            createdAt: memo.created_at || memo.createdAt,
            updatedAt: memo.updated_at || memo.updatedAt
          }
        })
        console.log('Mapped memos:', mappedMemos)
        setMemos(mappedMemos)
      }
    } catch (error) {
      console.error('Error fetching memos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      fetchMemos()
    }
  }, [user, fetchMemos])

  // 메모 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim() || !user) return

    try {
      const { error } = await supabase
        .from('memos')
        .insert({
          title: formData.title,
          content: formData.content,
          user_id: user.id
        })

      if (error) {
        console.error('Error creating memo:', error)
      } else {
        console.log('Memo created successfully')
        setFormData({ title: '', content: '' })
        setIsCreating(false)
        // 메모 생성 후 즉시 목록 새로고침
        setTimeout(() => {
          fetchMemos()
        }, 100)
      }
    } catch (error) {
      console.error('Error creating memo:', error)
    }
  }

  // 메모 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error deleting memo:', error)
      } else {
        fetchMemos()
      }
    } catch (error) {
      console.error('Error deleting memo:', error)
    }
  }

  // 메모 편집 시작
  const handleEdit = (memo: Memo) => {
    setEditingMemoId(memo.id)
    setEditFormData({ title: memo.title, content: memo.content })
  }

  // 메모 편집 저장
  const handleEditSave = async (memoId: string) => {
    if (!editFormData.title.trim() || !editFormData.content.trim() || !user) return

    try {
      const { error } = await supabase
        .from('memos')
        .update({
          title: editFormData.title,
          content: editFormData.content
        })
        .eq('id', memoId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating memo:', error)
      } else {
        setEditingMemoId(null)
        setEditFormData({ title: '', content: '' })
        fetchMemos()
      }
    } catch (error) {
      console.error('Error updating memo:', error)
    }
  }

  // 메모 편집 취소
  const handleEditCancel = () => {
    setEditingMemoId(null)
    setEditFormData({ title: '', content: '' })
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth/signin')
    }
  }

  // 폼 취소
  const handleCancel = () => {
    setFormData({ title: '', content: '' })
    setIsCreating(false)
  }

  // 로딩 중이거나 사용자가 없을 때
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">메모앱</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              안녕하세요, {user.user_metadata?.name || user.email}님
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 새 메모 작성 버튼 */}
        {!isCreating && (
          <div className="mb-8">
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 메모 작성
            </Button>
          </div>
        )}

        {/* 새 메모 작성 폼 */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>새 메모 작성</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="메모 제목을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="메모 내용을 입력하세요"
                    rows={6}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">저장</Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 메모 목록 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memos.map((memo) => (
            <Card key={memo.id} className="hover:shadow-md transition-shadow">
              {editingMemoId === memo.id ? (
                // 편집 모드
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`edit-title-${memo.id}`}>제목</Label>
                      <Input
                        id={`edit-title-${memo.id}`}
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        placeholder="메모 제목을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-content-${memo.id}`}>내용</Label>
                      <Textarea
                        id={`edit-content-${memo.id}`}
                        value={editFormData.content}
                        onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                        placeholder="메모 내용을 입력하세요"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(memo.id)}
                        disabled={!editFormData.title.trim() || !editFormData.content.trim()}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                      >
                        <X className="h-4 w-4 mr-1" />
                        취소
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                // 읽기 모드
                <>
                  <CardHeader>
                    <CardTitle className="text-lg">{memo.title}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            작성: {formatDate(memo.createdAt)}
                          </span>
                          {memo.updatedAt !== memo.createdAt && (
                            <span className="text-sm text-muted-foreground">
                              수정: {formatDate(memo.updatedAt)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          작성자: {user?.user_metadata?.nickname || user?.user_metadata?.name || user?.email || '알 수 없음'}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {memo.content}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(memo)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        편집
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(memo.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>

        {memos.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">아직 메모가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">
              새 메모를 작성해보세요!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
