
const API_BASE_URL = "http://127.0.0.1:3000/api";

/**
 * Send a request to the LMS backend and return its JSON response.
 */
async function request(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.error || `Request failed with status ${response.status}.`
        );
    }

    return data;
}

/**
 * Retrieve all courses.
 */
export async function getCourses() {
    const data = await request("/courses");
    return data.courses;
}

/**
 * Retrieve one course by its ID.
 */
export async function getCourse(courseId) {
    const data = await request(`/courses/${courseId}`);
    return data.course;
}

/**
 * Retrieve all lessons belonging to a course.
 */
export async function getCourseLessons(courseId) {
    const data = await request(`/courses/${courseId}/lessons`);
    return data.lessons;
}

/**
 * Retrieve one lesson by its ID.
 */
export async function getLesson(lessonId) {
    const data = await request(`/lessons/${lessonId}`);
    return data.lesson;
}

