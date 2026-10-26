
import {
    getLesson,
    getCourseLessons
} from "../services/api.js";

import {
    isLessonCompleted
} from "../services/storage.js";

import { escapeHTML } from "../utils/dom.js";

export async function renderLesson(lessonId) {
    try {
        // Fetch the selected lesson first.
        const lesson = await getLesson(lessonId);

        // Fetch the course curriculum for navigation and the sidebar.
        const courseLessons = await getCourseLessons(lesson.courseId);

        const currentIndex = courseLessons.findIndex(
            item => item.id === lesson.id
        );

        const previousLesson = courseLessons[currentIndex - 1];
        const nextLesson = courseLessons[currentIndex + 1];
        const completed = isLessonCompleted(lesson.id);

        const content = Array.isArray(lesson.content)
            ? lesson.content
            : [];

        const contentHTML = content.map(item => `
            <section class="lesson-content-section">
                <h2>${escapeHTML(item.heading || "")}</h2>
                <p>${escapeHTML(item.body || "")}</p>
            </section>
        `).join("");

        const sidebarHTML = courseLessons.map((item, index) => `
            <a class="lesson-sidebar-link
                ${item.id === lesson.id ? "current" : ""}"
               href="#lesson-${item.id}">
                <span>
                    ${isLessonCompleted(item.id) ? "✓" : index + 1}
                </span>

                ${escapeHTML(item.title)}
            </a>
        `).join("");

        return `
            <section class="learning-page">

                <a href="#course-${lesson.courseId}" class="back-link">
                    ← Back to ${escapeHTML(lesson.courseTitle)}
                </a>

                <div class="lesson-layout">

                    <article class="lesson-main">
                        <div class="lesson-breadcrumb">
                            ${escapeHTML(lesson.section || "")}
                        </div>

                        <h1 class="lesson-title">
                            ${escapeHTML(lesson.title)}
                        </h1>

                        <p class="lesson-duration">
                            Estimated duration:
                            ${escapeHTML(lesson.duration || "Not specified")}
                        </p>

                        <div class="lesson-body">
                            ${contentHTML ||
                                "<p>No content has been added to this lesson yet.</p>"}
                        </div>

                        <div class="lesson-completion">
                            <p>
                                ${completed
                                    ? "You have completed this lesson."
                                    : "Finish the lesson and mark it as completed."}
                            </p>

                            <button
                                type="button"
                                class="course-button"
                                data-action="toggle-completion"
                                data-lesson-id="${lesson.id}">
                                ${completed
                                    ? "Mark as Incomplete"
                                    : "Mark as Completed"}
                            </button>
                        </div>

                        <nav class="lesson-navigation"
                             aria-label="Lesson navigation">

                            ${previousLesson
                                ? `<a class="lesson-nav-link"
                                      href="#lesson-${previousLesson.id}">
                                      ← Previous Lesson
                                   </a>`
                                : "<span></span>"}

                            ${nextLesson
                                ? `<a class="lesson-nav-link"
                                      href="#lesson-${nextLesson.id}">
                                      Next Lesson →
                                   </a>`
                                : `<a class="lesson-nav-link"
                                      href="#course-${lesson.courseId}">
                                      Back to Course →
                                   </a>`}
                        </nav>
                    </article>

                    <aside class="lesson-sidebar">
                        <h2>Course Lessons</h2>

                        <p>${escapeHTML(lesson.courseTitle)}</p>

                        ${sidebarHTML}
                    </aside>

                </div>
            </section>
        `;
    } catch (error) {
        console.error("Failed to load lesson:", error);

        return `
            <section class="learning-page empty-state">
                <h2>Unable to load lesson</h2>
                <p>${escapeHTML(error.message)}</p>
                <a href="#courses" class="course-button">
                    Back to Courses
                </a>
            </section>
        `;
    }
}
