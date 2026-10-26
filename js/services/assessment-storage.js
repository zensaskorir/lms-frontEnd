
const ASSIGNMENTS_KEY = "learnhub.assignmentSubmissions";
const RESULTS_KEY = "learnhub.assessmentResults";

function readArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) ?? "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function writeArray(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function getAssignmentSubmissions() {
    return readArray(ASSIGNMENTS_KEY);
}

export function getAssignmentSubmission(assignmentId) {
    return getAssignmentSubmissions().find(
        item => item.assignmentId === Number(assignmentId)
    ) ?? null;
}

export function saveAssignmentSubmission(assignmentId, response) {
    const submissions = getAssignmentSubmissions();

    const submission = {
        assignmentId: Number(assignmentId),
        response: response.trim(),
        submittedAt: new Date().toISOString(),
        status: "Submitted",
        marksAwarded: null,
        feedback: null
    };

    const existingIndex = submissions.findIndex(
        item => item.assignmentId === submission.assignmentId
    );

    if (existingIndex >= 0) {
        submissions[existingIndex] = submission;
    } else {
        submissions.push(submission);
    }

    writeArray(ASSIGNMENTS_KEY, submissions);
    return submission;
}

export function getAssessmentResults() {
    return readArray(RESULTS_KEY);
}


export function getAssessmentResult(assessmentId) {
    return getAssessmentResults()
        .filter(item => item.assessmentId === Number(assessmentId))
        .at(-1) ?? null;
}


export function saveAssessmentResult(result) {
    const results = getAssessmentResults();

    const record = {
        ...result,
        assessmentId: Number(result.assessmentId),
        submittedAt: new Date().toISOString()
    };

    results.push(record);
    writeArray(RESULTS_KEY, results);

    return record;
}
export function gradeAssignmentSubmission(
    assignmentId,
    marksAwarded,
    feedback
) {
    const submissions = getAssignmentSubmissions();

    const submission = submissions.find(
        item => item.assignmentId === Number(assignmentId)
    );

    if (!submission) {
        throw new Error("Assignment submission not found.");
    }

    submission.marksAwarded = Number(marksAwarded);
    submission.feedback = feedback.trim();
    submission.status = "Graded";
    submission.gradedAt = new Date().toISOString();

    writeArray(ASSIGNMENTS_KEY, submissions);

    return submission;
}