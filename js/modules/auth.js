import {
    loginUser,
    registerUser
} from "../services/auth-storage.js";

import { escapeHTML } from "../utils/dom.js";

export function renderLogin() {
    return `
        <section class="auth-page">
            <div class="auth-card">
                <a href="#dashboard" class="auth-brand">LearnHub</a>

                <h1>Welcome back</h1>
                <p>Sign in to continue your learning journey.</p>

                <form id="login-form">
                    <label for="login-email">Email address</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                    >

                    <label for="login-password">Password</label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        autocomplete="current-password"
                        required
                    >

                    <p id="auth-error" class="auth-error" role="alert"></p>

                    <button class="course-button" type="submit">
                        Sign In
                    </button>
                </form>

                <p class="auth-switch">
                    Don't have an account?
                    <a href="#register">Create one</a>
                </p>
            </div>
        </section>
    `;
}

export function renderRegister() {
    return `
        <section class="auth-page">
            <div class="auth-card">
                <a href="#dashboard" class="auth-brand">LearnHub</a>

                <h1>Create your account</h1>
                <p>Join LearnHub and start learning.</p>

                <form id="register-form">
                    <label for="register-name">Full name</label>
                    <input
                        id="register-name"
                        name="name"
                        type="text"
                        autocomplete="name"
                        minlength="2"
                        maxlength="100"
                        required
                    >

                    <label for="register-email">Email address</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        autocomplete="email"
                        required
                    >

                    <label for="register-password">Password</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    >

                    <label for="confirm-password">Confirm password</label>
                    <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    >

                    <p id="auth-error" class="auth-error" role="alert"></p>

                    <button class="course-button" type="submit">
                        Create Account
                    </button>
                </form>

                <p class="auth-switch">
                    Already registered?
                    <a href="#login">Sign in</a>
                </p>
            </div>
        </section>
    `;
}

export async function handleLogin(form) {
    const email = form.elements.email.value;
    const password = form.elements.password.value;

    return loginUser({ email, password });
}

export async function handleRegister(form) {
    const name = form.elements.name.value;
    const email = form.elements.email.value;
    const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmPassword.value;

    if (password !== confirmPassword) {
        throw new Error("Your passwords do not match.");
    }

    return registerUser({ name, email, password });
}

export function showAuthError(form, message) {
    const errorElement = form.querySelector("#auth-error");

    if (errorElement) {
        errorElement.textContent = escapeHTML(message);
    }
}