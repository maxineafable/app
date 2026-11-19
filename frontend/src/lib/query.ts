export const meQuery = {
  queryKey: ['me'],
  staleTime: 5 * 60 * 1000,
  retry: false,
  queryFn: async () => {
    const res = await fetch('/api/manage/info', { credentials: 'include' })
    if (res.status === 401) return null
    if (!res.ok) throw new Error('failed to check session')
    return res.json() as Promise<{ email: string }>
  },
}