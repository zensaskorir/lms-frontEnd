const ACCOUNTS_KEY = "learnhub.accounts";
const SESSION_KEY = "learnhub.sessionUserId";

function readAccounts() {
    try {
        const accounts = JSON.parse(
            localStorage.getItem(ACCOUNTS_KEY) ?? "[]"
        );

        return Array.isArray(accounts) ? accounts : [];
    } catch {
        return [];
    }
}

function writeAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function hashPassword(password) {
    if (!globalThis.crypto?.subtle) {
        throw new Error(
            "Secure password hashing is unavailable. Run the app on localhost or HTTPS."
        );
    }

    const encoded = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", encoded);

    return Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

export async function registerUser({ name, email, password }) {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || password.length < 8) {
        throw new Error(
            "Enter your name, a valid email, and a password of at least 8 characters."
        );
    }

    const accounts = readAccounts();

    if (accounts.some(user => user.email === cleanEmail)) {
        throw new Error("An account with this email already exists.");
    }

    const user = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        role: "student",
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString()
    };

    accounts.push(user);
    writeAccounts(accounts);

    // Start a session for the new student.
    localStorage.setItem(SESSION_KEY, user.id);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

export async function loginUser({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = readAccounts();
    const user = accounts.find(item => item.email === cleanEmail);

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const passwordHash = await hashPassword(password);

    if (passwordHash !== user.passwordHash) {
        throw new Error("Invalid email or password.");
    }

    localStorage.setItem(SESSION_KEY, user.id);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

export function getCurrentUser() {
    const userId = localStorage.getItem(SESSION_KEY);

    if (!userId) {
        return null;
    }

    const user = readAccounts().find(
        item => item.id === userId
    );

    if (!user) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

export function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
}