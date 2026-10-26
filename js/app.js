
import {
    handleLogin,
    handleRegister,
    showAuthError
} from "./modules/auth.js";

import { assignments } from "../data/mock-assignments.js";

import {
    gradeAssignmentSubmission,
    saveAssignmentSubmission
} from "./services/assessment-storage.js";

import {
    getCurrentRole,
    setCurrentRole,
    updateUserRole
} from "./services/user-storage.js";

import { submitAssessment } from "./modules/assessments.js";
import { createRouter } from "./router.js";

import {
    getCompletedLessonIds,
    markLessonCompleted,
    markLessonIncomplete
} from "./services/storage.js";

// Main application elements.
const appContent = document.querySelector("#app-content");
const sidebar = document.querySelector("#sidebar");
const menuToggle = document.querySelector("#menu-toggle");
const appShell = document.querySelector("#app-shell");
const authRoot = document.querySelector("#auth-root");
const roleSelect = document.querySelector("#role-select");

// Initialize the router with separate application roots.
const router = createRouter({
    container: appContent,
    appShell,
    authRoot
});

// Update navigation and page heading after route changes.
function handleRouteChange() {
    const route = window.location.hash || "#dashboard";
    const isAuthRoute =
        route === "#login" || route === "#register";

    if (isAuthRoute) {
        sidebar?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
        return;
    }

    // Highlight the relevant navigation section.
    let navRoute = route;

    if (/^#course-\d+$/.test(route) ||
        /^#lesson-\d+$/.test(route)) {
        navRoute = "#courses";
    } else if (/^#assignment-\d+$/.test(route)) {
        navRoute = "#assignments";
    } else if (
        /^#assessment-\d+$/.test(route) ||
        /^#results-\d+$/.test(route)
    ) {
        navRoute = "#assessments";
    }

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === navRoute
        );
    });

    const activeLink = [...document.querySelectorAll(".nav-link")]
        .find(link => link.classList.contains("active"));

    const pageTitle = document.querySelector("#page-title");

    if (pageTitle && activeLink) {
        pageTitle.textContent = activeLink.textContent.trim();
    }

    sidebar?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
}

// Development-only role switcher.
if (roleSelect) {
    roleSelect.value = getCurrentRole();

    roleSelect.addEventListener("change", () => {
        setCurrentRole(roleSelect.value);

        const alreadyOnDashboard =
            (window.location.hash || "#dashboard") === "#dashboard";

        if (alreadyOnDashboard) {
            router.renderRoute();
            handleRouteChange();
        } else {
            window.location.hash = "#dashboard";
        }
    });
}

// Authentication forms render inside authRoot.
authRoot.addEventListener("submit", async event => {
    const form = event.target;

    if (
        !form.matches("#login-form") &&
        !form.matches("#register-form")
    ) {
        return;
    }

    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;

    try {
        if (form.matches("#login-form")) {
            await handleLogin(form);
        } else {
            await handleRegister(form);
        }

        window.location.hash = "#dashboard";

        // Render immediately, including when already on the dashboard.
        router.renderRoute();
        handleRouteChange();
    } catch (error) {
        showAuthError(
            form,
            error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."
        );
    } finally {
        button.disabled = false;
    }
});

// All LMS form submissions stay inside appContent.
appContent.addEventListener("submit", event => {
    const form = event.target;

    // Instructor: grade a student submission.
    if (form.matches(".grade-submission-form")) {
        event.preventDefault();

        if (getCurrentRole() !== "instructor") {
            alert("Switch to the instructor role to grade submissions.");
            return;
        }

        const assignmentId = Number(form.dataset.assignmentId);
        const marks = Number(form.elements.marksAwarded.value);
        const feedback = form.elements.feedback.value;

        const assignment = assignments.find(
            item => item.id === assignmentId
        );

        if (!assignment) {
            alert("Assignment not found.");
            return;
        }

        if (
            !Number.isFinite(marks) ||
            marks < 0 ||
            marks > assignment.totalMarks
        ) {
            alert(
                `Enter a mark between 0 and ${assignment.totalMarks}.`
            );
            return;
        }

        try {
            gradeAssignmentSubmission(
                assignmentId,
                marks,
                feedback
            );

            router.renderRoute();
            handleRouteChange();
        } catch (error) {
            console.error("Unable to save grade:", error);
            alert("Unable to save the grade. Please try again.");
        }

        return;
    }

    // Administrator: update a demo user's role.
    if (form.matches(".user-role-form")) {
        event.preventDefault();

        if (getCurrentRole() !== "admin") {
            alert("Switch to the administrator role to manage users.");
            return;
        }

        try {
            updateUserRole(
                Number(form.dataset.userId),
                form.elements.role.value
            );

            router.renderRoute();
            handleRouteChange();
        } catch (error) {
            console.error("Unable to update user role:", error);
            alert("Unable to update the user's role.");
        }

        return;
    }

    // Student: submit an assignment.
    if (form.matches("#assignment-form")) {
        event.preventDefault();

        const assignmentId = Number(form.dataset.assignmentId);
        const response = form.elements.response.value.trim();

        if (response.length < 20) {
            form.elements.response.setCustomValidity(
                "Please enter at least 20 characters."
            );
            form.reportValidity();
            form.elements.response.setCustomValidity("");
            return;
        }

        try {
            saveAssignmentSubmission(assignmentId, response);

            router.renderRoute();
            handleRouteChange();
        } catch (error) {
            console.error("Assignment submission failed:", error);
            alert("Unable to submit the assignment. Please try again.");
        }

        return;
    }

    // Student: submit a quiz.
    if (form.matches("#assessment-form")) {
        event.preventDefault();

        try {
            submitAssessment(
                Number(form.dataset.assessmentId),
                form
            );
        } catch (error) {
            console.error("Assessment submission failed:", error);
            alert("Unable to submit the assessment. Please try again.");
        }
    }
});

// Toggle lesson completion.
appContent.addEventListener("click", event => {
    const button = event.target.closest(
        '[data-action="toggle-completion"]'
    );

    if (!button) return;

    const lessonId = Number(button.dataset.lessonId);

    if (!Number.isInteger(lessonId)) return;

    if (getCompletedLessonIds().includes(lessonId)) {
        markLessonIncomplete(lessonId);
    } else {
        markLessonCompleted(lessonId);
    }

    router.renderRoute();
    handleRouteChange();
});

// Mobile sidebar.
menuToggle?.addEventListener("click", () => {
    const isOpen = sidebar?.classList.toggle("open") ?? false;

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Keep navigation state synchronized with URL changes.
window.addEventListener("hashchange", handleRouteChange);

// The router has already rendered the current route.
handleRouteChange();

console.log("LearnHub LMS initialized.");
