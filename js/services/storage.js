
const STORAGE_KEY = "learnhub.completedLessons";

function getCompletedLessons() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) ?? "[]"
        );

        return Array.isArray(saved)
            ? saved.filter(id => Number.isInteger(id))
            : [];
    } catch {
        return [];
    }
}

export function isLessonCompleted(lessonId) {
    return getCompletedLessons().includes(lessonId);
}

export function getCompletedLessonIds() {
    return getCompletedLessons();
}

export function markLessonCompleted(lessonId) {
    const completed = new Set(getCompletedLessons());
    completed.add(lessonId);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...completed])
    );
}

export function markLessonIncomplete(lessonId) {
    const completed = getCompletedLessons()
        .filter(id => id !== lessonId);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(completed)
    );
}
