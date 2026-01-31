'use client'
import { useUnsavedStore } from '@/Global/store/unsavedStore'
import Link from 'next/link'

interface SafeLinkProps {
    href: string
    children: React.ReactNode
    [key: string]: any
}

export default function SafeLink({ href, children, ...props }: SafeLinkProps) {

    const { hasUnsavedChanges, setHasUnsavedChanges } = useUnsavedStore()
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (hasUnsavedChanges) {
            e.preventDefault()
            if (window.confirm('Vous avez des modifications non enregistrées. Quitter sans enregistrer ?')) {
                setHasUnsavedChanges(false)
                window.location.href = href
            }
        }
    }

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    )
}