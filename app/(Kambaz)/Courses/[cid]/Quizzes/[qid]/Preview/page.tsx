"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import * as coursesClient from "../../../../client";
import * as quizClient from "../../client";
import * as accountClient from "../../../../../Account/client";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

type Question = {
    _id: string;
    title: string;
    points: number;
    question: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank" | "fill-in-the-blanks";
    choices?: string[];
    correctAnswer?: string | boolean;
    possibleAnswers?: string[];
};

type Quiz = {
    _id: string;
    title: string;
    questions?: Question[];
    multipleAttempts?: string | boolean;
    // Optional field if present to limit attempts
    attemptsAllowed?: number;
};

type LastAttempt = {
    quizId: string;
    attemptNumber: number;
    answers: Record<string, string | boolean>;
    score: number;
    totalPoints: number;
    takenAt?: string;
} | null;

export default function QuizPreviewPage() {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [started, setStarted] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
    const [score, setScore] = useState<number>(0);
    const [isStudent, setIsStudent] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [lastAttempt, setLastAttempt] = useState<LastAttempt>(null);
    const [attemptsCount, setAttemptsCount] = useState<number>(0);

    useEffect(() => {
        const load = async () => {
            if (!cid || !qid) return;
            try {
                setLoading(true);
                setError(null);
                // Load current user profile via Account client
                try {
                    const current = await accountClient.profile()
                    console.log("Current user profile:", current);
                    if (current && typeof current === "object") {
                        setUserId(current._id ?? current.user ?? null);
                        const role = String(current.role || "").toUpperCase()
                        console.log("Current user role:", role);
                        setIsStudent(role === "STUDENT");
                    }
                } catch {
                    // leave as faculty/preview if not logged in
                }
                const quizzes = await coursesClient.findQuizzesForCourse(cid);
                const current: Quiz | undefined = Array.isArray(quizzes)
                    ? (quizzes as Quiz[]).find((q) => q._id === qid)
                    : undefined;
                if (!current) {
                    setError("Quiz not found");
                }
                setQuiz(current ?? null);
                // If student, load last attempt and attempts count
                if (current && userId && (current.questions ?? []).length > 0) {
                    try {
                        const last = await quizClient.getLastQuizAttempt(cid, qid, userId);
                        setLastAttempt(last);
                    } catch { /* ignore */ }
                    try {
                        const { count } = await quizClient.getQuizAttemptsCount(cid, qid, userId);
                        setAttemptsCount(count ?? 0);
                    } catch { /* ignore */ }
                }
            } catch {
                setError("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };
        load();
        // userId affects attempt fetch; re-run when available
    }, [cid, qid, userId]);

    const totalPoints = useMemo(() => {
        return (quiz?.questions ?? []).reduce((sum, q) => sum + (q.points ?? 0), 0);
    }, [quiz]);

    const handleSubmit = async () => {
        if (!quiz) return;
        // Attempts enforcement: if not allow multiple, only one attempt; if allow, unlimited (or enforce if property exists)
        const allowMultiple = quiz?.multipleAttempts === "Yes" || quiz?.multipleAttempts === true;
        const limit = typeof quiz?.attemptsAllowed === "number" ? quiz!.attemptsAllowed : (allowMultiple ? Infinity : 1);
        if (isStudent && attemptsCount >= limit) {
            alert("No more attempts allowed for this quiz.");
            return;
        }
        if (isStudent && !allowMultiple && attemptsCount >= 1) {
            alert("No more attempts allowed for this quiz.");
            return;
        }
        let points = 0;
        for (const q of quiz.questions ?? []) {
            const ans = answers[q._id];
            if (q.type === "multiple-choice") {
                if (typeof ans === "string" && typeof q.correctAnswer === "string" && ans === q.correctAnswer) {
                    points += q.points ?? 0;
                }
            } else if (q.type === "true-false") {
                if (typeof ans === "boolean" && typeof q.correctAnswer === "boolean" && ans === q.correctAnswer) {
                    points += q.points ?? 0;
                }
            } else if (q.type === "fill-in-the-blank" || q.type === "fill-in-the-blanks") {
                if (typeof ans === "string") {
                    const candidate = ans.trim();
                    const valid = (q.possibleAnswers ?? []).some(a => a.trim() === candidate);
                    if (valid) points += q.points ?? 0;
                }
            }
        }
        setScore(points);
        setSubmitted(true);

        // If student, submit attempt to server (API will be added later)
        if (isStudent) {
            try {
                await quizClient.submitQuizAnswers(cid, qid, {
                    answers,
                    score: points,
                    totalPoints,
                });
                // Refresh attempts state
                if (userId) {
                    try {
                        const last = await quizClient.getLastQuizAttempt(cid, qid, userId);
                        setLastAttempt(last);
                        const { count } = await quizClient.getQuizAttemptsCount(cid, qid, userId);
                        setAttemptsCount(count ?? 0);
                    } catch { }
                }
            } catch {
                // Ignore errors for now; server route to be implemented
            }
        }
    };

    const resetPreview = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(0);
        setStarted(false);
    };

    const renderQuestion = (q: Question, idx: number) => {
        return (
            <Card key={q._id} className="mb-3">
                <Card.Header className="d-flex justify-content-between">
                    <span>
                        {idx + 1}. {q.title}
                    </span>
                    <span>{q.points} pts</span>
                </Card.Header>
                <Card.Body>
                    <Card.Text className="mb-3">{q.question}</Card.Text>

                    {/* Interactive answer controls */}
                    {q.type === "multiple-choice" && (
                        <div>
                            {(q.choices ?? []).map((c, i) => {
                                const selected = answers[q._id] === c;
                                const isCorrect = submitted && q.correctAnswer === c;
                                const isWrong = submitted && selected && q.correctAnswer !== c;
                                return (
                                    <div key={i} className="d-flex align-items-center gap-2 mb-2">
                                        <Form.Check
                                            name={`mc-${q._id}`}
                                            type="radio"
                                            disabled={!started || submitted}
                                            checked={selected}
                                            onChange={() => setAnswers(a => ({ ...a, [q._id]: c }))}
                                            aria-label={`Select choice ${i + 1}`}
                                        />
                                        <span className={isCorrect ? "text-success" : isWrong ? "text-danger" : ""}>{c}</span>
                                        {isCorrect && <span className="ms-2 text-success">✓</span>}
                                        {isWrong && <span className="ms-2 text-danger">✗</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {q.type === "true-false" && (
                        <div className="d-flex flex-column gap-2">
                            {[true, false].map((val, i) => {
                                const selected = answers[q._id] === val;
                                const isCorrect = submitted && q.correctAnswer === val;
                                const isWrong = submitted && selected && q.correctAnswer !== val;
                                return (
                                    <div key={i} className="d-flex align-items-center gap-2">
                                        <Form.Check
                                            name={`tf-${q._id}`}
                                            type="radio"
                                            disabled={!started || submitted}
                                            checked={selected}
                                            onChange={() => setAnswers(a => ({ ...a, [q._id]: val }))}
                                            aria-label={`Select ${val ? "True" : "False"}`}
                                        />
                                        <span className={isCorrect ? "text-success" : isWrong ? "text-danger" : ""}>
                                            {val ? "True" : "False"}
                                        </span>
                                        {isCorrect && <span className="ms-2 text-success">✓</span>}
                                        {isWrong && <span className="ms-2 text-danger">✗</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {(q.type === "fill-in-the-blank" || q.type === "fill-in-the-blanks") && (
                        <div className="d-flex flex-column gap-2">
                            <Form.Control
                                type="text"
                                placeholder="Your answer"
                                disabled={!started || submitted}
                                value={typeof answers[q._id] === "string" ? (answers[q._id] as string) : ""}
                                onChange={(e) => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
                            />
                            {submitted && (
                                <div>
                                    {(q.possibleAnswers ?? []).length > 0 && (
                                        <div className="text-muted">Acceptable answers: {(q.possibleAnswers ?? []).join(", ")}</div>
                                    )}
                                    {typeof answers[q._id] === "string" && (q.possibleAnswers ?? []).length > 0 && (
                                        ((q.possibleAnswers ?? []).some(a => a.trim() === String(answers[q._id]).trim())) ? (
                                            <div className="text-success">✓ Correct</div>
                                        ) : (
                                            <div className="text-danger">✗ Incorrect</div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>
        );
    };

    return (
        <div className="d-flex justify-content-center">
            <div className="w-100" style={{ maxWidth: 900 }}>
                {loading && <div>Loading…</div>}
                {!loading && error && <div className="text-danger">{error}</div>}
                {!loading && !error && (
                    <>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h2 className="mb-0">{quiz?.title ?? "Quiz"}</h2>
                        </div>
                        <h1>
                            isStudent: {isStudent ? "Yes" : "No"}
                        </h1>

                        {/* Controls */}
                        <div className="d-flex gap-2 mb-3">

                            {!started && (
                                <Button variant="primary" onClick={() => setStarted(true)} disabled={!quiz || (quiz?.questions?.length ?? 0) === 0 || (isStudent && attemptsCount >= (typeof quiz?.attemptsAllowed === "number" ? quiz!.attemptsAllowed : (quiz?.multipleAttempts === "Yes" || quiz?.multipleAttempts === true ? Infinity : 1)))}>
                                    {isStudent ? "Start Attempt" : "Start Preview"}
                                </Button>
                            )}
                            {started && !submitted && (
                                <Button variant="success" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            )}
                            {(started || submitted) && (
                                <Button variant="outline-secondary" onClick={resetPreview}>
                                    Reset
                                </Button>
                            )}
                            {submitted && (
                                <div className="ms-auto fw-semibold">
                                    Score: {score} / {totalPoints}
                                </div>
                            )}
                            {!started && isStudent && lastAttempt && (
                                <div className="ms-auto text-muted">
                                    Last attempt: {lastAttempt.score} / {lastAttempt.totalPoints}
                                </div>
                            )}
                        </div>

                        {quiz?.questions && quiz.questions.length > 0 ? (
                            quiz.questions.map((q, i) => renderQuestion(q, i))
                        ) : (
                            <div className="text-muted">No questions to preview.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
