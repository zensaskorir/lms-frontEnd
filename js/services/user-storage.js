import { mockUsers } from "../../data/mock-users.js";

const USERS_KEY = "learnhub.users";
const ROLE_KEY = "learnhub.currentRole";

const VALID_ROLES = ["student", "instructor", "admin"];

export function getUsers() {
    try {
        const savedUsers = JSON.parse(
            localStorage.getItem(USERS_KEY) ?? "null"
        );

        return Array.isArray(savedUsers)
            ? savedUsers
            : mockUsers.map(user => ({ ...user }));
    } catch {
        return mockUsers.map(user => ({ ...user }));
    }
}

export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentRole() {
    const role = localStorage.getItem(ROLE_KEY);

    return VALID_ROLES.includes(role) ? role : "student";
}

export function setCurrentRole(role) {
    if (!VALID_ROLES.includes(role)) {
        throw new Error("Invalid user role.");
    }

    localStorage.setItem(ROLE_KEY, role);
}

export function updateUserRole(userId, role) {
    if (!VALID_ROLES.includes(role)) {
        throw new Error("Invalid user role.");
    }

    const users = getUsers();
    const user = users.find(item => item.id === Number(userId));

    if (!user) {
        throw new Error("User not found.");
    }

    user.role = role;
    saveUsers(users);

    return user;
}