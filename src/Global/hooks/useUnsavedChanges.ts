'use client'
import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUnsavedStore } from '../store/unsavedStore'

export function useUnsavedChanges() {
  const router = useRouter()
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedStore()

  // 1. Fermeture onglet / refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // 2. Bouton retour du navigateur
  useEffect(() => {
    if (hasUnsavedChanges) {
      window.history.pushState(null, '', window.location.href)

      const handlePopState = () => {
        if (window.confirm('Quitter sans enregistrer ?')) {
          setHasUnsavedChanges(false)
          window.history.back()
        } else {
          window.history.pushState(null, '', window.location.href)
        }
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [hasUnsavedChanges])

  // 3. Navigation interne (router.push)
  const safePush = useCallback((href: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm('Quitter sans enregistrer ?')) {
        setHasUnsavedChanges(false)
        router.push(href)
      }
    } else {
      router.push(href)
    }
  }, [hasUnsavedChanges, router])


  // 4. Navigation interne (router.replace)
  const safeReplace = useCallback((href: string) => {
    if (hasUnsavedChanges) {
      if (window.confirm('Quitter sans enregistrer ?')) {
        setHasUnsavedChanges(false)
        router.replace(href)
      }
    } else {
      router.replace(href)
    }
  }, [hasUnsavedChanges, router])

  return {
    safePush,
    safeReplace,
  }
}