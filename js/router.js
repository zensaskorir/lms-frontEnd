
import {
    renderLogin,
    renderRegister
} from "./modules/auth.js";

import { renderDashboardForRole } from "./modules/dashboards.js";

import {
    renderCoursesView,
    initializeCatalog
} from "./modules/courses.js";

import { renderCourseDetails } from "./modules/course-details.js";
import { renderLesson } from "./modules/lessons.js";

import {
    renderAssignments,
    renderAssignmentDetails
} from "./modules/assignments.js";

import {
    renderAssessments,
    renderAssessment,
    renderAssessmentResults
} from "./modules/assessments.js";

export function createRouter({ container, appShell, authRoot }) {
    function renderRoute() {
        const route = window.location.hash || "#dashboard";

        const isAuthRoute =
            route === "#login" || route === "#register";

        // Choose the correct application root.
        appShell.hidden = isAuthRoute;
        authRoot.hidden = !isAuthRoute;

        // Standalone authentication pages.
        if (route === "#login") {
            authRoot.innerHTML = renderLogin();
            return;
        }

        if (route === "#register") {
            authRoot.innerHTML = renderRegister();
            return;
        }

        // Main dashboard.
        if (route === "#dashboard") {
            container.innerHTML = renderDashboardForRole();
            return;
        }

        // Course catalog.
        if (route === "#courses") {
            container.innerHTML = renderCoursesView();
            initializeCatalog(container);
            return;
        }

        // Assignment listing.
        if (route === "#assignments") {
            container.innerHTML = renderAssignments();
            return;
        }

        // Assessment listing.
        if (route === "#assessments") {
            container.innerHTML = renderAssessments();
            return;
        }

        // Assignment details.
        const assignmentMatch = route.match(/^#assignment-(\d+)$/);

        if (assignmentMatch) {
            container.innerHTML = renderAssignmentDetails(
                Number(assignmentMatch[1])
            );
            return;
        }

        // Assessment results.
        const resultsMatch = route.match(/^#results-(\d+)$/);

        if (resultsMatch) {
            container.innerHTML = renderAssessmentResults(
                Number(resultsMatch[1])
            );
            return;
        }

        // Individual assessment.
        const assessmentMatch = route.match(/^#assessment-(\d+)$/);

        if (assessmentMatch) {
            container.innerHTML = renderAssessment(
                Number(assessmentMatch[1])
            );
            return;
        }

        // Course details.
     
const courseMatch = route.match(/^#course-(\d+)$/);
if (courseMatch) {
    const courseId = Number(courseMatch[1]);

    container.innerHTML = `
        <section class="learning-page">
            <p>Loading course details...</p>
        </section>
    `;

    renderCourseDetails(courseId).then(html => {
        // Avoid rendering an old result if the user has navigated away.
        if (window.location.hash === route) {
            container.innerHTML = html;
        }
    });

    return;
}


        // Individual lesson.

const lessonMatch = route.match(/^#lesson-(\d+)$/);
if (lessonMatch) {
    const lessonId = Number(lessonMatch[1]);

    container.innerHTML = `
        <section class="learning-page">
            <p>Loading lesson...</p>
        </section>
    `;

    renderLesson(lessonId).then(html => {
        // Do not replace the page if the user has navigated elsewhere.
        if (window.location.hash === route) {
            container.innerHTML = html;
        }
    });

    return;
}


        // Unknown route.
        container.innerHTML = `
            <section class="learning-page empty-state">
                <h2>Page not found</h2>
                <p>The requested page is not available.</p>
                <a href="#dashboard" class="course-button">
                    Return to Dashboard
                </a>
            </section>
        `;
    }

    window.addEventListener("hashchange", renderRoute);

    renderRoute();

    return { renderRoute };
}
