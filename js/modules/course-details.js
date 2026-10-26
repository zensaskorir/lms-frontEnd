
import {
    getCourse,
    getCourseLessons
} from "../services/api.js";

import {
    getCompletedLessonIds
} from "../services/storage.js";

import { escapeHTML } from "../utils/dom.js";

export async function renderCourseDetails(courseId) {
    try {
        const [course, courseLessons] = await Promise.all([
            getCourse(courseId),
            getCourseLessons(courseId)
        ]);

        const completed = getCompletedLessonIds();

        const completedCount = courseLessons.filter(
            lesson => completed.includes(lesson.id)
        ).length;

        const progress = courseLessons.length
            ? Math.round(
                completedCount / courseLessons.length * 100
            )
            : 0;

        // Group lessons by section, preserving lesson order.
        const sections = courseLessons.reduce((groups, lesson) => {
            const section = lesson.section || "Course Lessons";

            if (!groups[section]) {
                groups[section] = [];
            }

            groups[section].push(lesson);
            return groups;
        }, {});

        const sectionsHTML = Object.entries(sections)
            .map(([section, sectionLessons]) => `
                <section class="lesson-section">
                    <h3>${escapeHTML(section)}</h3>

                    <div class="lesson-list">
                        ${sectionLessons.map((lesson, index) => {
                            const isComplete =
                                completed.includes(lesson.id);

                            return `
                                <a class="lesson-row"
                                   href="#lesson-${lesson.id}">

                                    <span class="lesson-number">
                                        ${isComplete ? "✓" : index + 1}
                                    </span>

                                    <span class="lesson-row-content">
                                        <strong>
                                            ${escapeHTML(lesson.title)}
                                        </strong>
                                        <small>
                                            ${escapeHTML(lesson.duration)}
                                        </small>
                                    </span>

                                    <span class="lesson-state">
                                        ${isComplete ? "Completed" : "Start"}
                                    </span>
                                </a>
                            `;
                        }).join("")}
                    </div>
                </section>
            `).join("");

        return `
            <section class="learning-page">

                <a href="#courses" class="back-link">
                    ← Back to Course Catalog
                </a>

                <header class="course-hero">
                    <span class="course-category">
                        ${escapeHTML(course.category)}
                    </span>

                    <h2>${escapeHTML(course.title)}</h2>

                    <p>${escapeHTML(course.description)}</p>

                    <div class="course-hero-meta">
                        <span>
                            Instructor: ${escapeHTML(course.instructor)}
                        </span>
                        <span>
                            Level: ${escapeHTML(course.level)}
                        </span>
                        <span>
                            Duration: ${escapeHTML(course.duration)}
                        </span>
                    </div>

                    <div class="course-progress-heading">
                        <strong>Your progress</strong>
                        <span>${progress}%</span>
                    </div>

                    <div class="progress-track"
                         role="progressbar"
                         aria-label="Overall course progress"
                         aria-valuemin="0"
                         aria-valuemax="100"
                         aria-valuenow="${progress}">
                        <div class="progress-fill"
                             style="width: ${progress}%"></div>
                    </div>

                    <p class="progress-summary">
                        ${completedCount} of ${courseLessons.length}
                        lessons completed
                    </p>
                </header>

                <div class="curriculum-header">
                    <h2>Course Curriculum</h2>
                    <p>
                        ${Object.keys(sections).length} sections ·
                        ${courseLessons.length} lessons
                    </p>
                </div>

                ${sectionsHTML ||
                    "<p>No lessons have been added yet.</p>"}

            </section>
        `;
    } catch (error) {
        console.error("Failed to load course details:", error);

        return `
            <section class="learning-page empty-state">
                <h2>Unable to load course</h2>
                <p>${escapeHTML(error.message)}</p>
                <a href="#courses" class="course-button">
                    Back to Courses
                </a>
            </section>
        `;
    }
}
