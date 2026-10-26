
import { assignments } from "../../data/mock-assignments.js";
import { courses } from "../../data/mock-courses.js";
import {
    getAssignmentSubmission
} from "../services/assessment-storage.js";
import { escapeHTML } from "../utils/dom.js";

function getAssignmentStatus(assignment) {
    if (getAssignmentSubmission(assignment.id)) {
        return "Submitted";
    }

    // Compare date-only values against the current local calendar date.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${assignment.dueDate}T00:00:00`);

    return dueDate < today ? "Overdue" : "Pending";
}

function formatDate(dateString) {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
        undefined,
        { day: "numeric", month: "short", year: "numeric" }
    );
}

export function renderAssignments() {
    return `
        <section class="learning-page">
            <div class="section-header">
                <div>
                    <h2>Assignments</h2>
                    <p>Review instructions and track your submissions.</p>
                </div>
            </div>

            <div class="assignment-list">
                ${assignments.map(assignment => {
                    const course = courses.find(
                        item => item.id === assignment.courseId
                    );

                    const status = getAssignmentStatus(assignment);

                    return `
                        <article class="assignment-card">
                            <div class="assignment-card-heading">
                                <span class="course-category">
                                    ${escapeHTML(course?.category ?? "Course")}
                                </span>
                                <span class="status-pill status-${status.toLowerCase()}">
                                    ${status}
                                </span>
                            </div>

                            <h3>${escapeHTML(assignment.title)}</h3>

                            <p>${escapeHTML(assignment.description)}</p>

                            <div class="assignment-meta">
                                <span>
                                    Course: ${escapeHTML(course?.title ?? "Unknown")}
                                </span>
                                <span>
                                    Due: ${formatDate(assignment.dueDate)}
                                </span>
                                <span>
                                    Marks: ${assignment.totalMarks}
                                </span>
                            </div>

                            <a class="course-button"
                               href="#assignment-${assignment.id}">
                                ${status === "Submitted"
                                    ? "View Submission"
                                    : "View Assignment"}
                                →
                            </a>
                        </article>
                    `;
                }).join("")}
            </div>
        </section>
    `;
}

export function renderAssignmentDetails(assignmentId) {
    const assignment = assignments.find(
        item => item.id === Number(assignmentId)
    );

    if (!assignment) {
        return `
            <section class="learning-page empty-state">
                <h2>Assignment not found</h2>
                <a href="#assignments" class="course-button">
                    Back to Assignments
                </a>
            </section>
        `;
    }

    const course = courses.find(
        item => item.id === assignment.courseId
    );

    const submission = getAssignmentSubmission(assignment.id);
    const status = getAssignmentStatus(assignment);
    const isOverdue = status === "Overdue";

    return `
        <section class="learning-page">
            <a href="#assignments" class="back-link">
                ← Back to Assignments
            </a>

            <article class="assignment-detail-card">
                <span class="course-category">
                    ${escapeHTML(course?.title ?? "Course")}
                </span>

                <h2>${escapeHTML(assignment.title)}</h2>

                <p>${escapeHTML(assignment.description)}</p>

                <div class="assignment-meta">
                    <span>Due: ${formatDate(assignment.dueDate)}</span>
                    <span>Maximum marks: ${assignment.totalMarks}</span>
                    <span>Status: ${status}</span>
                </div>

                <h3>Instructions</h3>

                <ol class="assignment-instructions">
                    ${assignment.instructions.map(instruction => `
                        <li>${escapeHTML(instruction)}</li>
                    `).join("")}
                </ol>

                ${submission ? `
                    <div class="submission-summary">
                        <h3>Your submission</h3>
                        <p class="submission-date">
                            Submitted:
                            ${formatDate(submission.submittedAt.slice(0, 10))}
                        </p>
                        <pre class="submission-response">${escapeHTML(submission.response)}</pre>
                        <p>Status: ${escapeHTML(submission.status)}</p>

                        ${submission.marksAwarded !== null
                            ? `<p>Marks: ${submission.marksAwarded} / ${assignment.totalMarks}</p>`
                            : `<p>Your submission has not yet been graded.</p>`}

                        ${submission.feedback
                            ? `<p>Feedback: ${escapeHTML(submission.feedback)}</p>`
                            : ""}
                    </div>
                ` : `
                    <form id="assignment-form"
                          data-assignment-id="${assignment.id}">

                        <label for="assignment-response">
                            Your written response
                        </label>

                        <textarea
                            id="assignment-response"
                            name="response"
                            rows="9"
                            minlength="20"
                            maxlength="10000"
                            placeholder="Write your answer here..."
                            required
                            ${isOverdue ? "disabled" : ""}
                        ></textarea>

                        <p class="form-hint">
                            Write at least 20 characters.
                        </p>

                        ${isOverdue
                            ? `<p class="error-message">
                                This assignment is overdue and cannot be submitted.
                               </p>`
                            : `<button class="course-button" type="submit">
                                Submit Assignment
                               </button>`}
                    </form>
                `}
            </article>
        </section>
    `;
}
