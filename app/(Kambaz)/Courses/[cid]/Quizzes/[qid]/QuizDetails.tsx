"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import type { Quiz, updateQuiz, addQuiz, setQuiz } from "../reducer";
import type { RootState } from "../../../../store";
import * as coursesClient from "../../../client";
import * as quizClient from "../client";


// ---------- helpers ----------
const isEmpty = (v: unknown): v is null | undefined | "" =>
    v === null || v === undefined || v === "";

type YesNoInput = string | number | boolean | null | undefined;

export const yesNo = (
    v: YesNoInput,
    fallback: "Yes" | "No" = "No"
): "Yes" | "No" => {
    if (v === true || v === 1 || v === "1" || v === "Yes" || v === "yes") return "Yes";
    if (v === false || v === 0 || v === "0" || v === "No" || v === "no") return "No";
    return fallback;
};

export const minutes = (v: number | string | null | undefined): string => {
    if (isEmpty(v)) return "—";
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) && n > 0 ? `${n} Minutes` : "—";
};

export const textOr = (
    v: string | number | null | undefined,
    fallback = "—"
): string => (isEmpty(v) ? fallback : String(v));

export const todayStr: string = new Date().toISOString().split("T")[0];

// Optional fields that may live only in client/editor for now
type ExtendedQuiz = Quiz & {
    description?: string;
    type?: string;
    timeLimit?: number | string;
    multipleAttempts?: YesNoInput;
    assignmentGroup?: string;
    shuffleAnswer?: YesNoInput;
    showCorrectAnswers?: string | number | boolean;
    accessCode?: YesNoInput;
    oneQuestionAtATime?: YesNoInput;
    webcamRequired?: YesNoInput;
    lockQuestionAfterAsnwering?: YesNoInput;
};

// ---------- component ----------
export default function QuizDetails() {
    const { cid, qid } = useParams() as { cid: string; qid: string };
    console.log('cid: ', { cid }, 'qid: ', { qid });
    const quizzes = useSelector((s: RootState) => s.quizReducer.quizzes);
    const quiz = quizzes.find((q: any) => q._id === qid) as ExtendedQuiz | undefined;
    console.log('Found quiz from quizzes', quiz);


    if (!quiz) {
        return (
            <div className="p-4">
                <h4 className="mb-3">Quiz not found</h4>
                <Link href={`/Courses/${cid}/Quizzes`} className="btn btn-secondary">
                    Back
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* centered header buttons */}
            <div className="d-flex align-items-center justify-content-center mb-3">
                <div className="d-flex gap-2">
                    <Link
                        href={`/Courses/${cid}/Quizzes/${qid}/Preview`}
                        className="btn btn-outline-secondary"
                    >
                        Preview
                    </Link>
                    <Link
                        href={`/Courses/${cid}/Quizzes/${qid}/QuizEditor`}
                        className="btn btn-outline-secondary"
                    >
                        Edit
                    </Link>
                </div>
            </div>

            <Card className="p-3" style={{ borderStyle: "dashed" as const }}>
                <div className="px-3 py-2">
                    <h3 className="mb-3">{quiz?.title || "Untitled Quiz"}</h3>

                    <Row className="gy-2">
                        <Col xs={6} className="text-end fw-semibold">Description</Col>
                        <Col xs={6}>{quiz?.description || "No description provided"}</Col>

                        <Col xs={6} className="text-end fw-semibold">Quiz Type</Col>
                        <Col xs={6}>{textOr(quiz?.type, "Graded Quiz")}</Col>

                        <Col xs={6} className="text-end fw-semibold">Points</Col>
                        <Col xs={6}>{quiz?.points ?? 0}</Col>

                        <Col xs={6} className="text-end fw-semibold">Assignment Group</Col>
                        <Col xs={6}>{textOr(quiz?.assignmentGroup, "QUIZZES")}</Col>

                        <Col xs={6} className="text-end fw-semibold">Shuffle Answers</Col>
                        <Col xs={6}>{yesNo(quiz?.shuffleAnswer, "No")}</Col>

                        <Col xs={6} className="text-end fw-semibold">Time Limit</Col>
                        <Col xs={6}>{minutes(quiz?.timeLimit ?? 30)}</Col>

                        <Col xs={6} className="text-end fw-semibold">Multiple Attempts</Col>
                        <Col xs={6}>{yesNo(quiz?.multipleAttempts, "No")}</Col>

                        <Col xs={6} className="text-end fw-semibold">View Responses</Col>
                        <Col xs={6}>Always</Col>

                        <Col xs={6} className="text-end fw-semibold">Show Correct Answers</Col>
                        <Col xs={6}>{textOr(quiz?.showCorrectAnswers, "Immediately")}</Col>

                        <Col xs={6} className="text-end fw-semibold">One Question at a Time</Col>
                        <Col xs={6}>{yesNo(quiz?.oneQuestionAtATime, "Yes")}</Col>

                        <Col xs={6} className="text-end fw-semibold">
                            Require Respondus LockDown Browser
                        </Col>
                        <Col xs={6}>No</Col>

                        <Col xs={6} className="text-end fw-semibold">
                            Required to View Quiz Results
                        </Col>
                        <Col xs={6}>No</Col>

                        <Col xs={6} className="text-end fw-semibold">Webcam Required</Col>
                        <Col xs={6}>{yesNo(quiz?.webcamRequired, "No")}</Col>

                        <Col xs={6} className="text-end fw-semibold">
                            Lock Questions After Answering
                        </Col>
                        <Col xs={6}>{yesNo(quiz?.lockQuestionAfterAsnwering, "No")}</Col>
                    </Row>

                    <div className="my-4" />

                    <Table>
                        <thead>
                            <tr>
                                <th>Due</th>
                                <th>For</th>
                                <th>Available</th>
                                <th>Until</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{quiz?.dueDate ?? todayStr}</td>
                                <td>Everyone</td>
                                <td>{quiz?.availableFrom ?? todayStr}</td>
                                <td>{quiz?.until ?? todayStr}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}