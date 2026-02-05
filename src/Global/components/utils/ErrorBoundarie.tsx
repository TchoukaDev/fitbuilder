import * as React from 'react';
import { ReactNode } from 'react';

// Les props qu'on va recevoir
interface Props {
    children: ReactNode;
    fallback: ReactNode;
}

// L'état interne
interface State {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }
    // 🆕 Cette méthode est appelée automatiquement quand un enfant crash
    static getDerivedStateFromError(_error: Error) {
        // On retourne le nouvel état
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error(error, info);
    }

    render() {
        if (this.state.hasError) {
            //Si erreur -> On retourne le fallback
            return this.props.fallback;
        }

        // Si pas erreur -> On retourne les enfants normalement
        return this.props.children;
    }
}

export default ErrorBoundary;