import { courses } from "../../data/mock-courses.js";
import { lessons } from "../../data/mock-lessons.js";
import { assignments } from "../../data/mock-assignments.js";
import { assessments } from "../../data/mock-assessments.js";

import {
    getAssignmentSubmissions,
    getAssessmentResults
} from "../services/assessment-storage.js";

import {
    getCurrentRole,
    getUsers
} from "../services/user-storage.js";

import { escapeHTML } from "../utils/dom.js";

function getCompletedLessonIds() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("learnhub.completedLessons") ?? "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function formatDate(dateString) {
    if (!dateString) return "Not available";

    const date = new Date(dateString);

    return Number.isNaN(date.getTime())
        ? "Not available"
        : date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}

function metricCard(label, value, description) {
    return `
        <article class="dashboard-metric">
            <p class="metric-label">${escapeHTML(label)}</p>
            <h3>${value}</h3>
            <p class="metric-description">${escapeHTML(description)}</p>
        </article>
    `;
}

function renderStudentDashboard() {
    const completedIds = getCompletedLessonIds();
    const submissions = getAssignmentSubmissions();
    const results = getAssessmentResults();

    const completedCount = completedIds.length;

    const pendingAssignments = assignments.filter(assignment => {
        const submitted = submissions.some(
            item => item.assignmentId === assignment.id
        );

        const dueDate = new Date(`${assignment.dueDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return !submitted && dueDate >= today;
    });

    const overallProgress = lessons.length
        ? Math.round(completedCount / lessons.length * 100)
        : 0;

    return `
        <section class="dashboard-page">
            <header class="dashboard-welcome">
                <div>
                    <p class="dashboard-eyebrow">STUDENT PORTAL</p>
                    <h2>Welcome back!</h2>
                    <p>Continue learning and keep track of your progress.</p>
                </div>

                <a href="#courses" class="course-button">
                    Browse Courses →
                </a>
            </header>

            <div class="dashboard-metrics">
                ${metricCard("Available courses", courses.length, "Courses to explore")}
                ${metricCard("Lessons completed", completedCount, "Across your courses")}
                ${metricCard("Pending assignments", pendingAssignments.length, "Awaiting submission")}
                ${metricCard("Quiz attempts", results.length, "Completed attempts")}
            </div>

            <section class="dashboard-panel">
                <div class="section-header">
                    <div>
                        <h2>Your Learning Progress</h2>
                        <p>Overall lesson completion</p>
                    </div>
                    <strong>${overallProgress}%</strong>
                </div>

                <div
                    class="progress-track"
                    role="progressbar"
                    aria-valuenow="${overallProgress}"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Overall lesson completion"
                >
                    <div
                        class="progress-fill"
                        style="width: ${overallProgress}%"
                    ></div>
                </div>
            </section>

            <section class="dashboard-panel">
                <div class="section-header">
                    <div>
                        <h2>Continue Learning</h2>
                        <p>Pick up where you left off.</p>
                    </div>
                    <a href="#courses" class="text-link">All courses →</a>
                </div>

                <div class="dashboard-course-grid">
                    ${courses.map(course => {
                        const courseLessons = lessons.filter(
                            lesson => lesson.courseId === course.id
                        );

                        const completed = courseLessons.filter(
                            lesson => completedIds.includes(lesson.id)
                        ).length;

                        const progress = courseLessons.length
                            ? Math.round(
                                completed / courseLessons.length * 100
                            )
                            : 0;

                        return `
                            <article class="dashboard-course-card">
                                <span class="course-category">
                                    ${escapeHTML(course.category ?? "Course")}
                                </span>
                                <h3>${escapeHTML(course.title)}</h3>
                                <p>
                                    ${completed} of ${courseLessons.length}
                                    lessons completed
                                </p>

                                <div class="progress-track">
                                    <div
                                        class="progress-fill"
                                        style="width: ${progress}%"
                                    ></div>
                                </div>

                                <a
                                    class="course-button"
                                    href="#course-${course.id}"
                                >
                                    Open Course →
                                </a>
                            </article>
                        `;
                    }).join("")}
                </div>
            </section>

            <div class="dashboard-shortcuts">
                <a href="#assignments" class="dashboard-shortcut">
                    <h3>Assignments</h3>
                    <p>View instructions, due dates and submissions.</p>
                </a>

                <a href="#assessments" class="dashboard-shortcut">
                    <h3>Assessments</h3>
                    <p>Take quizzes and review your scores.</p>
                </a>
            </div>
        </section>
    `;
}

function renderInstructorDashboard() {
    const submissions = getAssignmentSubmissions();
    const results = getAssessmentResults();

    return `
        <section class="dashboard-page">
            <header class="dashboard-welcome">
                <div>
                    <p class="dashboard-eyebrow">INSTRUCTOR PORTAL</p>
                    <h2>Instructor Dashboard</h2>
                    <p>Manage assignments and review student work.</p>
                </div>
            </header>

            <div class="dashboard-metrics">
                ${metricCard("Courses", courses.length, "Available course records")}
                ${metricCard("Assignments", assignments.length, "Assignment activities")}
                ${metricCard("Submissions", submissions.length, "Student submissions")}
                ${metricCard("Quiz attempts", results.length, "Assessment attempts")}
            </div>

            <section class="dashboard-panel">
                <div class="section-header">
                    <div>
                        <h2>Assignment Submissions</h2>
                        <p>Review written work and enter marks and feedback.</p>
                    </div>
                </div>

                ${submissions.length === 0
                    ? `<div class="empty-state">
                        <h3>No submissions yet</h3>
                        <p>Student submissions will appear here.</p>
                       </div>`
                    : `<div class="instructor-submissions">
                        ${submissions.map(submission => {
                            const assignment = assignments.find(
                                item => item.id === submission.assignmentId
                            );

                            if (!assignment) return "";

                            const course = courses.find(
                                item => item.id === assignment.courseId
                            );

                            return `
                                <article class="submission-card">
                                    <div class="section-header">
                                        <div>
                                            <h3>${escapeHTML(assignment.title)}</h3>
                                            <p>${escapeHTML(course?.title ?? "Course")}</p>
                                        </div>

                                        <span class="status-pill ${
                                            submission.marksAwarded !== null
                                                ? "status-submitted"
                                                : "status-pending"
                                        }">
                                            ${submission.marksAwarded !== null
                                                ? "Graded"
                                                : "Awaiting grade"}
                                        </span>
                                    </div>

                                    <p class="submission-date">
                                        Submitted: ${formatDate(submission.submittedAt)}
                                    </p>

                                    <pre class="submission-response">${escapeHTML(submission.response)}</pre>

                                    <form
                                        class="grade-submission-form"
                                        data-assignment-id="${assignment.id}"
                                    >
                                        <label>
                                            Marks (out of ${assignment.totalMarks})
                                            <input
                                                type="number"
                                                name="marksAwarded"
                                                min="0"
                                                max="${assignment.totalMarks}"
                                                step="1"
                                                value="${submission.marksAwarded ?? ""}"
                                                required
                                            >
                                        </label>

                                        <label>
                                            Instructor feedback
                                            <textarea
                                                name="feedback"
                                                rows="3"
                                                maxlength="2000"
                                                placeholder="Write feedback for the student..."
                                            >${escapeHTML(submission.feedback ?? "")}</textarea>
                                        </label>

                                        <button class="course-button" type="submit">
                                            Save Grade
                                        </button>
                                    </form>
                                </article>
                            `;
                        }).join("")}
                    </div>`}
            </section>
        </section>
    `;
}

function renderAdminDashboard() {
    const users = getUsers();
    const submissions = getAssignmentSubmissions();
    const results = getAssessmentResults();

    return `
        <section class="dashboard-page">
            <header class="dashboard-welcome">
                <div>
                    <p class="dashboard-eyebrow">ADMINISTRATION PORTAL</p>
                    <h2>Administrator Dashboard</h2>
                    <p>Review platform activity and manage demo user roles.</p>
                </div>
            </header>

            <div class="dashboard-metrics">
                ${metricCard("Registered users", users.length, "Demo user accounts")}
                ${metricCard("Courses", courses.length, "Available course records")}
                ${metricCard("Assignments", assignments.length, "Learning activities")}
                ${metricCard("Quiz attempts", results.length, "Assessment attempts")}
            </div>

            <section class="dashboard-panel">
                <div class="section-header">
                    <div>
                        <h2>User Management</h2>
                        <p>Change the role assigned to a demo user.</p>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="dashboard-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
    <tr>
        <td>${escapeHTML(user.name)}</td>
        <td>${escapeHTML(user.email)}</td>
        <td>${escapeHTML(user.role)}</td>
        <td>
            <form
                class="user-role-form"
                data-user-id="${user.id}"
            >
                <select
                    name="role"
                    aria-label="New role for ${escapeHTML(user.name)}"
                >
                    <option value="student"
                        ${user.role === "student" ? "selected" : ""}>
                        Student
                    </option>
                    <option value="instructor"
                        ${user.role === "instructor" ? "selected" : ""}>
                        Instructor
                    </option>
                    <option value="admin"
                        ${user.role === "admin" ? "selected" : ""}>
                        Admin
                    </option>
                </select>

                <button class="course-button" type="submit">
                    Save Role
                </button>
            </form>
        </td>
    </tr>
`).join("")}
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="dashboard-panel">
                <h2>Platform Activity</h2>
                <p>
                    ${submissions.length} assignment submission(s) and
                    ${results.length} quiz attempt(s) are currently stored
                    in this browser.
                </p>
            </section>
        </section>
    `;
}

export function renderDashboardForRole() {
    const role = getCurrentRole();

    if (role === "instructor") {
        return renderInstructorDashboard();
    }

    if (role === "admin") {
        return renderAdminDashboard();
    }

    return renderStudentDashboard();
}