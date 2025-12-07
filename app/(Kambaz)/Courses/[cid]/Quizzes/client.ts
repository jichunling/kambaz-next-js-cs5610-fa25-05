/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
const QUIZZES_API = `${HTTP_SERVER}/api/quizzes`;
const COURSES_API = `${HTTP_SERVER}/api/courses`;

export const deleteQuiz = async (quizId: string) => {
  const response = await axios.delete(`${QUIZZES_API}/${quizId}`);
  return response.data;
};

export const updateQuiz = async (cid: string, quiz: any) => {
  const { data } = await axios.put(`${COURSES_API}/${cid}/quizzes/${quiz._id}`, quiz);
  return data;
};

export const findQuizById = async (quizId: string) => {
  console.log('----Quiz Client: findQuizById----')
  const response = await axios.get(`${QUIZZES_API}/${quizId}`);
  console.log('Found quiz by id: ', response);
  return response.data;
};

export const updateQuizPublishStatus = async (quizId: string, published: boolean) => {
  const { data } = await axios.put(`${QUIZZES_API}/${quizId}/publish`, { published });
  return data;
};

export const createQuestion = async (courseId: string, quizId: string, question: any) => {
  const { data } = await axios.post(`${COURSES_API}/${courseId}/quizzes/${quizId}/questions`, question);
  return data;
};