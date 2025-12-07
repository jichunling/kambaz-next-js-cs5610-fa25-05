/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
const axiosWithCredentials = axios.create({ baseURL: HTTP_SERVER, withCredentials: true });

export const deleteQuiz = async (quizId: string) => {
  const response = await axiosWithCredentials.delete(`/api/quizzes/${quizId}`);
  return response.data;
};

export const updateQuiz = async (cid: string, quiz: any) => {
  const { data } = await axiosWithCredentials.put(`/api/courses/${cid}/quizzes/${quiz._id}`, quiz);
  return data;
};

export const findQuizById = async (quizId: string) => {
  console.log('----Quiz Client: findQuizById----')
  const response = await axiosWithCredentials.get(`/api/quizzes/${quizId}`);
  console.log('Found quiz by id: ', response);
  return response.data;
};

export const updateQuizPublishStatus = async (quizId: string, published: boolean) => {
  const { data } = await axiosWithCredentials.put(`/api/quizzes/${quizId}/publish`, { published });
  return data;
};

export const createQuestion = async (courseId: string, quizId: string, question: any) => {
  const { data } = await axiosWithCredentials.post(`/api/courses/${courseId}/quizzes/${quizId}/questions`, question);
  return data;
};

export const deleteQuestion = async (courseId: string, quizId: string, questionId: string) => {
  const { data } = await axiosWithCredentials.delete(`/api/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`);
  return data;
};

// --- Student quiz answer persistence (APIs to be added server-side) ---
// Save a single answer (optional progressive save)
export const saveQuizAnswer = async (
  courseId: string,
  quizId: string,
  questionId: string,
  answer: string | boolean
) => {
  const { data } = await axiosWithCredentials.post(
    `/api/courses/${courseId}/quizzes/${quizId}/answers/${questionId}`,
    { answer }
  );
  return data;
};

// Submit full quiz attempt with all answers and computed score
export const submitQuizAnswers = async (
  courseId: string,
  quizId: string,
  payload: {
    answers: Record<string, string | boolean>;
    score: number;
    totalPoints: number;
  }
) => {
  const { data } = await axiosWithCredentials.post(
    `/api/courses/${courseId}/quizzes/${quizId}/attempts`,
    payload
  );
  return data;
};

export const getLastQuizAttempt = async (
  courseId: string,
  quizId: string,
  userId: string
) => {
  const { data } = await axiosWithCredentials.get(
    `/api/courses/${courseId}/quizzes/${quizId}/attempts/last`,
    { params: { userId } }
  );
  return data;
};

export const getQuizAttemptsCount = async (
  courseId: string,
  quizId: string,
  userId: string
) => {
  const { data } = await axiosWithCredentials.get(
    `/api/courses/${courseId}/quizzes/${quizId}/attempts/count`,
    { params: { userId } }
  );
  return data as { count: number };
};