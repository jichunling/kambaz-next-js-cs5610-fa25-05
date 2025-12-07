"use client";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MultipleChoice from "./MultipleChoice";
import TrueFalse from "./TrueFalse";
import FillInTheBlank from "./FillInTheBlank";
import * as coursesClient from "../../../../client";

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
    const router = useRouter();
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

    const handleCancel = () => {
        // Dismiss edits: go back to the quiz page
        router.push(`/Courses/${cid}/Quizzes/${qid}`);
    };

    const newQuestion = () => {
        setItems((prev) => [...prev, { id: newId(), type: questionType }]);
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const removeExisting = (questionId: string) => {
        setExistingQuestions((prev) => prev.filter((q) => q._id !== questionId));
    };

    const handleSave = async () => {
        console.log("Saving quiz questions...");
    };

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