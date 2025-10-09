export interface Memo {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
  user?: {
    email: string
    user_metadata?: {
      name?: string
      nickname?: string
    }
  }
}

