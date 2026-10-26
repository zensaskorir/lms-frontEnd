
import { lessons } from "../../data/mock-lessons.js";
import { getCompletedLessonIds } from "../services/storage.js";
import { getCourses } from "../services/api.js";
import { escapeHTML } from "../utils/dom.js";

function getCourseProgress(course) {
    const completed = getCompletedLessonIds();

    const courseLessons = lessons.filter(
        lesson => lesson.courseId === course.id
    );

    if (courseLessons.length === 0) return 0;

    const completedCount = courseLessons.filter(
        lesson => completed.includes(lesson.id)
    ).length;

    return Math.round(
        (completedCount / courseLessons.length) * 100
    );
}

function createCourseCard(course) {
    const progress = getCourseProgress(course);

    return `
        <article class="course-card">
            <span class="course-category">
                ${escapeHTML(course.category)}
            </span>

            <h3>${escapeHTML(course.title)}</h3>

            <p class="course-description">
                ${escapeHTML(course.description)}
            </p>

            <div class="course-info">
                <span>Instructor</span>
                <strong>${escapeHTML(course.instructor)}</strong>
            </div>

            <div class="course-info">
                <span>Level</span>
                <strong>${escapeHTML(course.level)}</strong>
            </div>

            <div class="course-info">
                <span>Expected lessons</span>
                <strong>${course.totalLessons}</strong>
            </div>

            <div class="course-progress-heading">
                <span>Progress</span>
                <span>${progress}%</span>
            </div>

            <div class="progress-track"
                 role="progressbar"
                 aria-label="${escapeHTML(course.title)} progress"
                 aria-valuemin="0"
                 aria-valuemax="100"
                 aria-valuenow="${progress}">
                <div class="progress-fill"
                     style="width: ${progress}%"></div>
            </div>

            <a class="course-button"
               href="#course-${course.id}">
                ${progress === 100
                    ? "Review Course"
                    : progress > 0
                        ? "Continue Learning"
                        : "Start Learning"}
                →
            </a>
        </article>
    `;
}

export function renderCoursesView() {
    return `
        <section class="learning-page">
            <div class="section-header">
                <div>
                    <h2>Course Catalog</h2>
                    <p>
                        Explore courses and continue developing your skills.
                    </p>
                </div>
                <span class="catalog-count" id="catalog-count">
                    Loading courses...
                </span>
            </div>

            <div class="catalog-toolbar">
                <label for="catalog-search" class="sr-only">
                    Search courses
                </label>

                <input type="search"
                       id="catalog-search"
                       placeholder="Search by course, category or instructor..."
                       disabled>

                <label for="category-filter" class="sr-only">
                    Filter by category
                </label>

                <select id="category-filter" disabled>
                    <option value="">All categories</option>
                </select>
            </div>

            <div class="courses-grid catalog-grid"
                 id="catalog-courses">
                <p>Loading courses from the database...</p>
            </div>

            <p class="catalog-empty" id="catalog-empty" hidden>
                No courses match your search.
            </p>

            <p id="catalog-error" role="alert" hidden></p>
        </section>
    `;
}

export async function initializeCatalog(container) {
    const search = container.querySelector("#catalog-search");
    const category = container.querySelector("#category-filter");
    const grid = container.querySelector("#catalog-courses");
    const empty = container.querySelector("#catalog-empty");
    const error = container.querySelector("#catalog-error");
    const count = container.querySelector("#catalog-count");

    try {
        const courses = await getCourses();

        count.textContent = `${courses.length} courses`;

        category.innerHTML = `
            <option value="">All categories</option>
            ${[...new Set(courses.map(course => course.category))]
                .map(item => `
                    <option value="${escapeHTML(item)}">
                        ${escapeHTML(item)}
                    </option>
                `).join("")}
        `;

        function filterCourses() {
            const query = search.value.trim().toLowerCase();
            const selectedCategory = category.value;

            const filtered = courses.filter(course => {
                const searchableText = [
                    course.title,
                    course.description,
                    course.category,
                    course.instructor
                ].join(" ").toLowerCase();

                return searchableText.includes(query) &&
                    (!selectedCategory ||
                        course.category === selectedCategory);
            });

            grid.innerHTML = filtered.map(createCourseCard).join("");
            empty.hidden = filtered.length !== 0;
        }

        search.disabled = false;
        category.disabled = false;

        search.addEventListener("input", filterCourses);
        category.addEventListener("change", filterCourses);

        filterCourses();
    } catch (err) {
        console.error("Failed to load course catalog:", err);

        count.textContent = "Courses unavailable";
        grid.innerHTML = "";
        error.textContent =
            `Unable to load courses: ${err.message}`;
        error.hidden = false;
    }
}
