
import { assessments } from "../../data/mock-assessments.js";
import { courses } from "../../data/mock-courses.js";
import {
    getAssessmentResults,
    getAssessmentResult,
    saveAssessmentResult
} from "../services/assessment-storage.js";
import { escapeHTML } from "../utils/dom.js";

export function renderAssessments() {
    const results = getAssessmentResults();

    return `
        <section class="learning-page">
            <div class="section-header">
                <div>
                    <h2>Assessments</h2>
                    <p>Test your knowledge and review your results.</p>
                </div>
            </div>

            <div class="assessment-list">
                ${assessments.map(assessment => {
                    const course = courses.find(
                        item => item.id === assessment.courseId
                    );

                    const attempts = results.filter(
                        item => item.assessmentId === assessment.id
                    );

                    const latestAttempt = attempts.at(-1);

                    return `
                        <article class="assessment-card">
                            <span class="course-category">
                                ${escapeHTML(course?.category ?? "Course")}
                            </span>

                            <h3>${escapeHTML(assessment.title)}</h3>

                            <p>${escapeHTML(assessment.description)}</p>

                            <div class="assignment-meta">
                                <span>
                                    Questions: ${assessment.questions.length}
                                </span>
                                <span>
                                    Duration: ${assessment.durationMinutes} min
                                </span>
                                <span>
                                    Pass mark: ${assessment.passMark}%
                                </span>
                            </div>

                            ${latestAttempt ? `
                                <p class="assessment-previous-result">
                                    Latest score: ${latestAttempt.score}%
                                </p>
                            ` : `
                                <p class="assessment-previous-result">
                                    Not attempted yet
                                </p>
                            `}

                            <a class="course-button"
                               href="#assessment-${assessment.id}">
                                ${attempts.length ? "Attempt Again" : "Start Assessment"}
                                →
                            </a>

                            ${latestAttempt ? `
                                <a class="text-link result-link"
                                   href="#results-${assessment.id}">
                                    View Latest Result
                                </a>
                            ` : ""}
                        </article>
                    `;
                }).join("")}
            </div>
        </section>
    `;
}

export function renderAssessment(assessmentId) {
    const assessment = assessments.find(
        item => item.id === Number(assessmentId)
    );

    if (!assessment) {
        return `
            <section class="learning-page empty-state">
                <h2>Assessment not found</h2>
                <a href="#assessments" class="course-button">
                    Back to Assessments
                </a>
            </section>
        `;
    }

    const course = courses.find(
        item => item.id === assessment.courseId
    );

    return `
        <section class="learning-page">
            <a href="#assessments" class="back-link">
                ← Back to Assessments
            </a>

            <header class="assessment-header">
                <span class="course-category">
                    ${escapeHTML(course?.title ?? "Course")}
                </span>

                <h2>${escapeHTML(assessment.title)}</h2>

                <p>${escapeHTML(assessment.description)}</p>

                <div class="assignment-meta">
                    <span>${assessment.questions.length} questions</span>
                    <span>${assessment.durationMinutes} minutes</span>
                    <span>Pass mark: ${assessment.passMark}%</span>
                </div>
            </header>

            <form id="assessment-form"
                  data-assessment-id="${assessment.id}">

                ${assessment.questions.map((question, index) => `
                    <fieldset class="question-card">
                        <legend>
                            ${index + 1}. ${escapeHTML(question.question)}
                        </legend>

                        ${question.options.map((option, optionIndex) => `
                            <label class="answer-option">
                                <input
                                    type="radio"
                                    name="question-${question.id}"
                                    value="${optionIndex}"
                                    required
                                >
                                <span>${escapeHTML(option)}</span>
                            </label>
                        `).join("")}
                    </fieldset>
                `).join("")}

                <button class="course-button" type="submit">
                    Submit Assessment
                </button>
            </form>
        </section>
    `;
}

export function submitAssessment(assessmentId, form) {
    const assessment = assessments.find(
        item => item.id === Number(assessmentId)
    );

    if (!assessment) {
        throw new Error("Assessment not found.");
    }

    // Native form validation ensures each question is answered.
    if (!form.reportValidity()) {
        return null;
    }

    const answers = assessment.questions.map(question => {
        const selected = form.querySelector(
            `input[name="question-${question.id}"]:checked`
        );

        return {
            questionId: question.id,
            selectedAnswer: Number(selected.value)
        };
    });

    const correctCount = answers.filter(answer => {
        const question = assessment.questions.find(
            item => item.id === answer.questionId
        );

        return answer.selectedAnswer === question.correctAnswer;
    }).length;

    const score = Math.round(
        correctCount / assessment.questions.length * 100
    );

    const result = saveAssessmentResult({
        assessmentId: assessment.id,
        answers,
        correctCount,
        totalQuestions: assessment.questions.length,
        score,
        passed: score >= assessment.passMark
    });

    window.location.hash = `#results-${assessment.id}`;

    return result;
}

export function renderAssessmentResults(assessmentId) {
    const assessment = assessments.find(
        item => item.id === Number(assessmentId)
    );

    const result = getAssessmentResult(assessmentId);

    if (!assessment || !result) {
        return `
            <section class="learning-page empty-state">
                <h2>No assessment result found</h2>
                <p>Complete an assessment to see your results.</p>
                <a href="#assessments" class="course-button">
                    Back to Assessments
                </a>
            </section>
        `;
    }

    const answerMap = new Map(
        result.answers.map(answer => [
            answer.questionId,
            answer.selectedAnswer
        ])
    );

    return `
        <section class="learning-page">
            <a href="#assessments" class="back-link">
                ← Back to Assessments
            </a>

            <header class="result-summary">
                <h2>${escapeHTML(assessment.title)} — Results</h2>

                <p class="result-score">${result.score}%</p>

                <span class="status-pill ${
                    result.passed ? "status-passed" : "status-failed"
                }">
                    ${result.passed ? "Passed" : "Not Passed"}
                </span>

                <p>
                    Correct answers: ${result.correctCount}
                    out of ${result.totalQuestions}
                </p>

                <p>Required pass mark: ${assessment.passMark}%</p>
            </header>

            <h2 class="review-heading">Answer Review</h2>

            ${assessment.questions.map((question, index) => {
                const selected = answerMap.get(question.id);
                const isCorrect = selected === question.correctAnswer;

                return `
                    <article class="review-card">
                        <h3>
                            ${index + 1}. ${escapeHTML(question.question)}
                        </h3>

                        <p class="${isCorrect ? "correct-answer" : "incorrect-answer"}">
                            Your answer:
                            ${escapeHTML(question.options[selected] ?? "Not answered")}
                        </p>

                        <p>
                            Correct answer:
                            ${escapeHTML(question.options[question.correctAnswer])}
                        </p>

                        <p class="answer-explanation">
                            ${escapeHTML(question.explanation)}
                        </p>
                    </article>
                `;
            }).join("")}

            <a class="course-button"
               href="#assessment-${assessment.id}">
                Try Again
            </a>
        </section>
    `;
}
