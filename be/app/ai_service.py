from __future__ import annotations
from typing import List
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Use the same client/structure as example.py
from google import genai

load_dotenv()


class RoadmapWeek(BaseModel):
    week: int
    theme: str
    tasks: List["TaskItem"]
    videos: List[str] = []


class LearningRoadmap(BaseModel):
    weeks: List[RoadmapWeek]


class TaskItem(BaseModel):
    description: str


class AIQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int


class QuizData(BaseModel):
    questions: List[AIQuestion]


class AIService:
    def __init__(self) -> None:
        # API key is read from environment by the client
        self.client = genai.Client()
        self.flash_model_name = "gemini-2.5-flash-lite"
        self.pro_model_name = "gemini-2.5-pro"

    async def generate_roadmap(self, topic: str, details: str = "") -> LearningRoadmap:
        contents = (
            "Hey Chat, I want you to act like a professional mentor and generate a structured 6-month (24-week) learning roadmap for me.\n"
            "🔹 Goal: I want to learn [SUBJECT/GOAL] in 6 months (24 weeks).\n"
            "Guidelines:\n"
            "Split the 6 months into 24 weeks.\n"
            'For each week, provide a list of actionable to-dos only (not grouped by "read/watch/practice").\n'
            "For each todo, return JSON objects with fields: 'description' (plain text without any quadrant tags) and 'quadrant' (one of Q1, Q2, Q3, Q4).\n"
            "Distribute quadrants fairly (don’t dump everything into Q1).\n"
            "Quadrant meanings: Q1 Urgent+Important, Q2 NotUrgent+Important, Q3 Urgent+NotImportant, Q4 NotUrgent+NotImportant.\n"
            "Assume ~3 hours/day of effort, and Sundays are rest days.\n"
            "At the end of each week, add a Weekly Review Task (quiz, reflection, or mini-project), also tagged with its quadrant.\n"
            "By Week 24, I should demonstrate competence through a capstone project (likely Q1).\n"
            "Additionally, for each week include an array 'videos' containing 2-4 curated YouTube URLs that best support that week's theme.\n"
            "Return a strict JSON object matching the provided schema.\n"
            f"Subject/goal: {topic}. Additional details: {details}"
        )
        response = self.client.models.generate_content(
            model=self.pro_model_name,
            contents=contents,
            config={
                "response_mime_type": "application/json",
                "response_schema": LearningRoadmap,
            },
        )
        return LearningRoadmap.model_validate_json(response.text)

    async def generate_quiz(
        self,
        topic: str,
        difficulty: str,
        plan_context: str = "",
        week_start: int = 1,
        week_end: int = 24,
    ) -> QuizData:
        contents = (
            f"Create a short quiz with exactly 5 real-world multiple-choice questions on '{topic}' at {difficulty} difficulty.\n"
            f"Focus ONLY on material from weeks {week_start} to {week_end} in the plan summary below.\n"
            "Each question must have EXACTLY 4 options (A–D) and provide 'correct_answer' as a 0-based index.\n"
            "Do not include more than 4 options. Do not include explanations in the JSON.\n"
            "Plan context (condensed):\n" + plan_context + "\n\n"
            "After generating the JSON for questions, also provide a short bullet list (outside JSON) of 3–5 highly relevant YouTube video URLs that match the same scope, so the app can surface them in the player."
        )
        response = self.client.models.generate_content(
            model=self.flash_model_name,
            contents=contents,
            config={
                "response_mime_type": "application/json",
                "response_schema": QuizData,
            },
        )
        return QuizData.model_validate_json(response.text)

    async def generate_video_summary(
        self, video_title: str, video_description: str = ""
    ) -> str:
        contents = (
            "Provide a concise summary of this YouTube video.\n"
            f"Title: {video_title}\n"
            f"Description: {video_description}"
        )
        response = self.client.models.generate_content(
            model=self.flash_model_name,
            contents=contents,
        )
        return response.text or ""

    async def answer_contextual_question(
        self, question: str, video_context: str
    ) -> str:
        contents = (
            "Based on this context, answer the user's question.\n"
            f"Context: {video_context}\n"
            f"Question: {question}"
        )
        response = self.client.models.generate_content(
            model=self.flash_model_name,
            contents=contents,
        )
        return response.text or ""


ai_service = AIService()
