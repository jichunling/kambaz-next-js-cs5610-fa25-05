"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as client from "../../client";

type InitialQuestion = {
    _id?: string;
    title?: string;
    points?: number;
    question?: string;
    choices?: string[];
    correctAnswer?: string;
};

type Choice = { id: string; text: string };

export default function MultipleChoice({ onCancel, initial }: { onCancel?: () => void; initial?: InitialQuestion }) {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [points, setPoints] = useState<number | "">("");
    const [question, setQuestion] = useState("");
    const [choices, setChoices] = useState<Choice[]>([
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
        // If there's an existing ID, delete from server first
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
                // This should not happen if the above validation is correct
                alert("An error occurred. Could not find the correct choice.");
                return;
            }
            const payload = {
                type: "multiple-choice",
                title: title.trim(),
                points: Number(points),
                question: question.trim(),
                choices: nonEmpty.map(c => c.text),
                correctAnswer: correctChoice.text,
            };
            await client.createQuestion(cid, qid, payload);
            // router.push(`/Courses/${cid}/Quizzes/${qid}`);
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
                    {/* Replace textarea with a WYSIWYG like react-quill later if desired */}
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