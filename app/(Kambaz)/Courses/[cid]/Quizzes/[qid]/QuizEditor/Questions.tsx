"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as coursesClient from "../../../../client";
import * as client from "../../client";

type QType = "multiple-choice" | "true-false" | "fill-in-the-blank";
type QuestionItem = { id: string; type: QType };

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
type Quiz = { _id: string; title: string; questions?: Question[] };

export default function Questions() {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const [saving] = useState(false);
    const [questionType, setQuestionType] = useState<QType>("multiple-choice");

    const [items, setItems] = useState<QuestionItem[]>([]);
    const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const newId = () =>
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);


    const newQuestion = () => {
        setItems((prev) => [...prev, { id: newId(), type: questionType }]);
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const removeExisting = (questionId: string) => {
        setExistingQuestions((prev) => prev.filter((q) => q._id !== questionId));
    };

    // Note: page-level cancel/save controls are currently not in use.

    // Load existing questions for this quiz (auto-populated)
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const quizzes = await coursesClient.findQuizzesForCourse(cid);
                const current: Quiz | undefined = Array.isArray(quizzes)
                    ? (quizzes as Quiz[]).find((q) => q._id === qid)
                    : undefined;
                setExistingQuestions(current?.questions ?? []);
            } catch (err) {
                console.error("Failed to fetch quizzes/questions", err);
            } finally {
                setLoading(false);
            }
        };
        if (cid && qid) fetchQuizzes();
    }, [cid, qid]);

    return (
        <div className="d-flex justify-content-center flex-column gap-2 mb-3">
            <div className="d-flex justify-content-center">
                <Button
                    variant="light"
                    className="bg-white border border-dark"
                    onClick={newQuestion}
                    disabled={saving}
                >
                    + Question
                </Button>
            </div>

            <div className="d-flex justify-content-center">
                <Form.Select
                    aria-label="Select question type"
                    value={questionType}
                    onChange={(e) =>
                        setQuestionType(e.target.value as QType)
                    }
                    className="bg-white border border-dark text-secondary"
                    style={{ minWidth: "14rem", maxWidth: "18rem" }}
                >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="fill-in-the-blank">Fill in the Blank</option>
                </Form.Select>
            </div>

            <hr />

            <div className="d-flex flex-column gap-4">
                {loading && <div>Loading…</div>}
                {!loading && existingQuestions.length === 0 && (
                    <div className="text-muted">No questions yet.</div>
                )}
                {!loading && existingQuestions.length > 0 && (
                    <>
                        {existingQuestions
                            .filter((q) => q.type === "multiple-choice")
                            .map((q) => (
                                <MultipleChoice
                                    key={q._id}
                                    onCancel={() => removeExisting(q._id)}
                                    initial={{
                                        _id: q._id,
                                        title: q.title,
                                        points: q.points,
                                        question: q.question,
                                        choices: q.choices,
                                        correctAnswer: typeof q.correctAnswer === "string" ? q.correctAnswer : undefined,
                                    }}
                                />
                            ))}
                        {existingQuestions
                            .filter((q) => q.type === "true-false")
                            .map((q) => (
                                <TrueFalse
                                    key={q._id}
                                    onCancel={() => removeExisting(q._id)}
                                    initial={{
                                        _id: q._id,
                                        title: q.title,
                                        points: q.points,
                                        question: q.question,
                                        correctAnswer: typeof q.correctAnswer === "boolean" ? q.correctAnswer : undefined,
                                    }}
                                />
                            ))}
                        {existingQuestions
                            .filter((q) => q.type === "fill-in-the-blank" || q.type === "fill-in-the-blanks")
                            .map((q) => (
                                <FillInTheBlank
                                    key={q._id}
                                    onCancel={() => removeExisting(q._id)}
                                    initial={{
                                        _id: q._id,
                                        title: q.title,
                                        points: q.points,
                                        question: q.question,
                                        possibleAnswers: Array.isArray(q.possibleAnswers) ? q.possibleAnswers : [],
                                    }}
                                />
                            ))}
                    </>
                )}
            </div>

            <div className="d-flex flex-column gap-4">
                {items.map((it) => (
                    <div key={it.id}>
                        {it.type === "multiple-choice" && (
                            <MultipleChoice onCancel={() => removeItem(it.id)} />
                        )}
                        {it.type === "true-false" && (
                            <TrueFalse onCancel={() => removeItem(it.id)} />
                        )}
                        {it.type === "fill-in-the-blank" && (
                            <FillInTheBlank onCancel={() => removeItem(it.id)} />
                        )}
                    </div>
                ))}
            </div>

            {/* <div className="d-flex gap-2 justify-content-center mt-3">
                <Button variant="danger" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave}
                    variant="light"
                    className="bg-white border border-dark">
                    Save
                </Button>
            </div> */}
        </div>
    );
}

// =====================
// Inline subcomponents
// =====================

type MCInitial = {
    _id?: string;
    title?: string;
    points?: number;
    question?: string;
    choices?: string[];
    correctAnswer?: string;
};

type MCChoice = { id: string; text: string };

function MultipleChoice({ onCancel, initial }: { onCancel?: () => void; initial?: MCInitial }) {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [points, setPoints] = useState<number | "">("");
    const [question, setQuestion] = useState("");
    const [choices, setChoices] = useState<MCChoice[]>([
        { id: newId(), text: "" },
        { id: newId(), text: "" },
    ]);
    const [correctId, setCorrectId] = useState<string | null>(null);

    function newId() {
        return typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
    }

    const handleDelete = async () => {
        if (initial?._id) {
            try {
                await client.deleteQuestion(cid, qid, initial._id);
            } catch {
                alert("Failed to delete question");
                return;
            }
        }
        if (onCancel) onCancel();
    };

    useEffect(() => {
        if (!initial) return;
        if (typeof initial.title === "string") setTitle(initial.title);
        if (typeof initial.points === "number") setPoints(initial.points);
        if (typeof initial.question === "string") setQuestion(initial.question);
        const initialChoices = Array.isArray(initial.choices) ? initial.choices : [];
        const mapped = initialChoices.length > 0
            ? initialChoices.map((txt) => ({ id: newId(), text: txt }))
            : [{ id: newId(), text: "" }, { id: newId(), text: "" }];
        setChoices(mapped);
        if (typeof initial.correctAnswer === "string") {
            const match = mapped.find((c) => c.text === initial.correctAnswer);
            setCorrectId(match ? match.id : null);
        } else {
            setCorrectId(null);
        }
    }, [initial]);

    const addChoice = () => {
        setChoices((prev) => [...prev, { id: newId(), text: "" }]);
    };

    const removeChoice = (id: string) => {
        setChoices((prev) => prev.filter((c) => c.id !== id));
        if (correctId === id) setCorrectId(null);
    };

    const updateChoice = (id: string, text: string) => {
        setChoices((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
    };

    const handleSave = async () => {
        const trimmed = choices.map(c => ({ ...c, text: c.text.trim() }));
        const nonEmpty = trimmed.filter(c => c.text.length > 0);
        if (!title.trim()) return alert("Please enter a title.");
        if (points === "" || isNaN(Number(points))) return alert("Please enter points.");
        if (!question.trim()) return alert("Please enter the question text.");
        if (nonEmpty.length < 2) return alert("Please provide at least two choices.");
        if (!correctId || !nonEmpty.some(c => c.id === correctId)) return alert("Please select the correct answer.");

        setSaving(true);
        try {
            const correctChoice = nonEmpty.find(c => c.id === correctId);
            if (!correctChoice) {
                alert("An error occurred. Could not find the correct choice.");
                return;
            }
            const payload = {
                type: "multiple-choice" as const,
                title: title.trim(),
                points: Number(points),
                question: question.trim(),
                choices: nonEmpty.map(c => c.text),
                correctAnswer: correctChoice.text,
            };
            await client.createQuestion(cid, qid, payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="d-flex justify-content-center">
            <div className="w-100" style={{ maxWidth: 820 }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <Form.Group className="flex-grow-1">
                        <Form.Label className="mb-1">Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Easy Question"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-flex flex-column align-items-end" style={{ minWidth: 140 }}>
                        <Form.Label className="mb-1">Points</Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            value={points}
                            onChange={(e) => setPoints(e.target.value === "" ? "" : Number(e.target.value))}
                            style={{ maxWidth: 80 }}
                        />
                    </div>
                </div>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Question:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Enter your question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </Form.Group>

                <div className="mb-2 fw-semibold">Answers:</div>

                <div className="d-flex flex-column gap-2 mb-2">
                    {choices.map((c, idx) => (
                        <div key={c.id} className="d-flex align-items-center gap-2">
                            <Form.Check
                                name="correct-choice"
                                type="radio"
                                checked={correctId === c.id}
                                onChange={() => setCorrectId(c.id)}
                                aria-label={`Mark choice ${idx + 1} as correct`}
                            />
                            <Form.Control
                                type="text"
                                placeholder={`Possible Answer ${idx + 1}`}
                                value={c.text}
                                onChange={(e) => updateChoice(c.id, e.target.value)}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => removeChoice(c.id)}
                                title="Remove answer"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-end mb-3">
                    <Button variant="link" onClick={addChoice} className="text-decoration-none">
                        + Add Another Answer
                    </Button>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        Delete
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        variant="light"
                        className="bg-white border border-dark"
                        style={{ minWidth: "12rem" }}
                    >
                        {saving ? "Saving…" : "Save Question"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

type InitialTF = {
    _id?: string;
    title?: string;
    points?: number;
    question?: string;
    correctAnswer?: boolean;
};

function TrueFalse({ onCancel, initial }: { onCancel?: () => void; initial?: InitialTF }) {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [points, setPoints] = useState<number | "">("");
    const [question, setQuestion] = useState("");
    const [correct, setCorrect] = useState<boolean | null>(null);

    const handleDelete = async () => {
        if (initial?._id) {
            try {
                await client.deleteQuestion(cid, qid, initial._id);
            } catch {
                alert("Failed to delete question");
                return;
            }
        }
        if (onCancel) onCancel();
    };

    const handleSave = async () => {
        if (!title.trim()) return alert("Please enter a title.");
        if (points === "" || isNaN(Number(points))) return alert("Please enter points.");
        if (!question.trim()) return alert("Please enter the question text.");
        if (correct === null) return alert("Please select True or False as the correct answer.");

        setSaving(true);
        try {
            const payload = {
                type: "true-false" as const,
                title: title.trim(),
                points: Number(points),
                question: question.trim(),
                correctAnswer: correct,
            };
            await client.createQuestion(cid, qid, payload);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!initial) return;
        if (typeof initial.title === "string") setTitle(initial.title);
        if (typeof initial.points === "number") setPoints(initial.points);
        if (typeof initial.question === "string") setQuestion(initial.question);
        if (typeof initial.correctAnswer === "boolean") setCorrect(initial.correctAnswer);
    }, [initial]);

    return (
        <div className="d-flex justify-content-center">
            <div className="w-100" style={{ maxWidth: 820 }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <Form.Group className="flex-grow-1">
                        <Form.Label className="mb-1">Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Is 2 + 2 = 4?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-flex flex-column align-items-end" style={{ minWidth: 140 }}>
                        <Form.Label className="mb-1">Points</Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            value={points}
                            onChange={(e) =>
                                setPoints(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            style={{ maxWidth: 80 }}
                        />
                    </div>
                </div>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Question:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Enter your question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </Form.Group>

                <div className="mb-2 fw-semibold">Answers:</div>

                <div className="d-flex flex-column gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <Form.Check
                            name="tf-correct"
                            type="radio"
                            checked={correct === true}
                            onChange={() => setCorrect(true)}
                            aria-label="Mark True as correct"
                        />
                        <span>True</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Check
                            name="tf-correct"
                            type="radio"
                            checked={correct === false}
                            onChange={() => setCorrect(false)}
                            aria-label="Mark False as correct"
                        />
                        <span>False</span>
                    </div>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        Delete
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        variant="light"
                        className="bg-white border border-dark"
                        style={{ minWidth: "12rem" }}
                    >
                        {saving ? "Saving…" : "Save Question"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

type FIBAns = { id: string; text: string };

type InitialFIB = {
    _id?: string;
    title?: string;
    points?: number;
    question?: string;
    possibleAnswers?: string[];
};

function FillInTheBlank({ onCancel, initial }: { onCancel?: () => void; initial?: InitialFIB }) {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [points, setPoints] = useState<number | "">("");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<FIBAns[]>([
        { id: newId(), text: "" },
        { id: newId(), text: "" },
    ]);
    const [caseInsensitive, setCaseInsensitive] = useState(true);

    function newId() {
        return typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2);
    }

    const handleDelete = async () => {
        if (initial?._id) {
            try {
                await client.deleteQuestion(cid, qid, initial._id);
            } catch {
                alert("Failed to delete question");
                return;
            }
        }
        if (onCancel) onCancel();
    };

    const addAnswer = () => {
        setAnswers((prev) => [...prev, { id: newId(), text: "" }]);
    };

    const removeAnswer = (id: string) => {
        setAnswers((prev) => prev.filter((a) => a.id !== id));
    };

    const updateAnswer = (id: string, text: string) => {
        setAnswers((prev) => prev.map((a) => (a.id === id ? { ...a, text } : a)));
    };

    const handleSave = async () => {
        const trimmed = answers.map((a) => ({ ...a, text: a.text.trim() }));
        const nonEmpty = trimmed.filter((a) => a.text.length > 0);

        if (!title.trim()) return alert("Please enter a title.");
        if (points === "" || isNaN(Number(points))) return alert("Please enter points.");
        if (!question.trim()) return alert("Please enter the question text.");
        if (nonEmpty.length < 1) return alert("Please provide at least one possible answer.");

        setSaving(true);
        try {
            const payload = {
                type: "fill-in-the-blanks" as const,
                title: title.trim(),
                points: Number(points),
                question: question.trim(),
                possibleAnswers: nonEmpty.map((a) => a.text),
            };
            await client.createQuestion(cid, qid, payload);

        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!initial) return;
        if (typeof initial.title === "string") setTitle(initial.title);
        if (typeof initial.points === "number") setPoints(initial.points);
        if (typeof initial.question === "string") setQuestion(initial.question);
        const fibAnswers = Array.isArray(initial.possibleAnswers) ? initial.possibleAnswers : [];
        const mapped = fibAnswers.length > 0
            ? fibAnswers.map((txt) => ({ id: newId(), text: txt }))
            : [{ id: newId(), text: "" }, { id: newId(), text: "" }];
        setAnswers(mapped);
    }, [initial]);

    return (
        <div className="d-flex justify-content-center">
            <div className="w-100" style={{ maxWidth: 820 }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                    <Form.Group className="flex-grow-1">
                        <Form.Label className="mb-1">Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="How much is 2 + 2 = ____?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-flex flex-column align-items-end" style={{ minWidth: 140 }}>
                        <Form.Label className="mb-1">Points</Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            value={points}
                            onChange={(e) =>
                                setPoints(e.target.value === "" ? "" : Number(e.target.value))
                            }
                            style={{ maxWidth: 80 }}
                        />
                    </div>
                </div>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Question:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Enter your question with a blank students will fill in…"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </Form.Group>

                <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="fw-semibold">Answers (acceptable):</div>
                    <Form.Check
                        type="switch"
                        id="case-insensitive"
                        label="Case insensitive"
                        checked={caseInsensitive}
                        onChange={(e) => setCaseInsensitive(e.target.checked)}
                    />
                </div>

                <div className="d-flex flex-column gap-2 mb-2">
                    {answers.map((a, idx) => (
                        <div key={a.id} className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="text"
                                placeholder={`Possible Answer ${idx + 1}`}
                                value={a.text}
                                onChange={(e) => updateAnswer(a.id, e.target.value)}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => removeAnswer(a.id)}
                                title="Remove answer"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="d-flex justify-content-end mb-3">
                    <Button variant="link" onClick={addAnswer} className="text-decoration-none">
                        + Add Another Answer
                    </Button>
                </div>

                <div className="d-flex gap-2 justify-content-end">
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        Delete
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        variant="light"
                        className="text-secondary bg-white border border-dark"
                        style={{ minWidth: "12rem" }}
                    >
                        {saving ? "Saving…" : "Save Question"}
                    </Button>
                </div>
            </div>
        </div>
    );
}