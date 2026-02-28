// Les services lancent ces erreurs pour signaler un problème métier.
// La route API les attrape avec instanceof pour choisir le bon status HTTP.
// Usage dans un service  : throw new DuplicateError("Un plan avec ce nom existe déjà")
// Usage dans une route   : if (e instanceof DuplicateError) → status 409

// Erreur lancée quand une ressource existe déjà (ex: nom de workout déjà pris)
// → la route renvoie un status 409 Conflict
export class DuplicateError extends Error {
    constructor(message: string) {
        super(message)       // stocke le message dans Error (accessible via e.message)
        this.name = "DuplicateError"  // nom unique pour que instanceof fonctionne
    }
}

// Erreur lancée quand une ressource est introuvable (ex: workout inexistant)
// → la route renvoie un status 404 Not Found
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "NotFoundError"
    }
}

export class DbError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DbError"
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string = "Non autorisé") {
        super(message)
        this.name = "UnauthorizedError"
    }
}

export class ValidationError extends Error {
    constructor(message: string = "Données invalides") {
        super(message)
        this.name = "ValidationError"

    }

}