'use client'

interface PasswordStrengthIndicatorProps {
  password: string
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    // 점수 계산
    if (checks.length) score += 1
    if (checks.lowercase) score += 1
    if (checks.uppercase) score += 1
    if (checks.numbers) score += 1
    if (checks.special) score += 1

    return { score, checks }
  }

  const { score, checks } = getPasswordStrength(password)
  
  const getStrengthLevel = (score: number) => {
    if (score <= 1) return { level: 'weak', color: 'bg-red-500', text: '약함' }
    if (score <= 3) return { level: 'medium', color: 'bg-orange-500', text: '보통' }
    return { level: 'strong', color: 'bg-green-500', text: '강함' }
  }

  const strength = getStrengthLevel(score)

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">보안 등급:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`w-3 h-2 rounded-sm ${
                index <= score ? strength.color : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${
          strength.level === 'weak' ? 'text-red-500' :
          strength.level === 'medium' ? 'text-orange-500' :
          'text-green-500'
        }`}>
          {strength.text}
        </span>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div className={`${checks.length ? 'text-green-600' : 'text-gray-400'}`}>
          ✓ 최소 8자 이상
        </div>
        <div className={`${checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
          ✓ 소문자 포함
        </div>
        <div className={`${checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
          ✓ 대문자 포함
        </div>
        <div className={`${checks.numbers ? 'text-green-600' : 'text-gray-400'}`}>
          ✓ 숫자 포함
        </div>
        <div className={`${checks.special ? 'text-green-600' : 'text-gray-400'}`}>
          ✓ 특수문자 포함
        </div>
      </div>
    </div>
  )
}
