import SupabaseSignUpForm from '@/components/supabase-signup-form'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">메모앱</h1>
          <p className="mt-2 text-muted-foreground">계정을 생성하여 메모를 관리하세요</p>
        </div>
        <SupabaseSignUpForm />
      </div>
    </div>
  )
}

