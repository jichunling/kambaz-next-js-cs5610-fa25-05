"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as client from "../../client";

type InitialTF = {
    _id?: string;
    title?: string;
    points?: number;
    question?: string;
    correctAnswer?: boolean;
};

export default function TrueFalse({ onCancel, initial }: { onCancel?: () => void; initial?: InitialTF }) {
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
                type: "true-false",
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

    // Prefill from initial question if provided
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