"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as client from "../../client";

type BlankAns = { id: string; text: string };

type InitialFIB = {
    _id?: string;
    title?: string;
    points?: number;
    question?: string;
    possibleAnswers?: string[];
};

export default function FillInTheBlank({ onCancel, initial }: { onCancel?: () => void; initial?: InitialFIB }) {
    const { cid, qid } = useParams<{ cid: string; qid: string }>();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [points, setPoints] = useState<number | "">("");
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState<BlankAns[]>([
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
    const handleCancel = () => {
        router.push(`/Courses/${cid}/Quizzes`);
    }

    const handleSave = async (publish: boolean) => {
        const trimmed = answers.map((a) => ({ ...a, text: a.text.trim() }));
        const nonEmpty = trimmed.filter((a) => a.text.length > 0);

        if (!title.trim()) return alert("Please enter a title.");
        if (points === "" || isNaN(Number(points))) return alert("Please enter points.");
        if (!question.trim()) return alert("Please enter the question text.");
        if (nonEmpty.length < 1) return alert("Please provide at least one possible answer.");

        setSaving(true);

        try {
            const payload = {
                type: "fill-in-the-blanks",
                title: title.trim(),
                points: Number(points),
                question: question.trim(),
                possibleAnswers: nonEmpty.map((a) => a.text),
            };
            await client.createQuestion(cid, qid, payload);

        } finally {
            setSaving(false);
            if (publish) {
                router.push(`/Courses/${cid}/Quizzes/${qid}/Preview`);
            } else {
                router.push(`/Courses/${cid}/Quizzes/${qid}`);
            }
        }
    };

    // Prefill from initial question if provided
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
                    <Button variant="danger" onClick={handleCancel} disabled={saving} >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={saving}>
                        Delete
                    </Button>
                    <Button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        variant="light"
                        className="text-secondary bg-white border border-dark"
                        style={{ minWidth: "12rem" }}
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        variant="light"
                        className="text-secondary bg-white border border-dark"
                        style={{ minWidth: "12rem" }}
                    >
                        {saving ? "Saving…" : "Publish and Save"}
                    </Button>
                </div>
            </div>
        </div>
    );
}