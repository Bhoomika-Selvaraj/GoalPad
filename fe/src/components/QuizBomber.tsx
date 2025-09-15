"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { aiAPI, dashboardAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import { FiLoader, FiRefreshCw, FiCheck, FiX } from "react-icons/fi";
import { Quiz } from "@/types";

const QuizBomber: React.FC = () => {
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [loading, setLoading] = useState(false);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<{
		[key: number]: number;
	}>({});
	const [showResults, setShowResults] = useState(false);
	const [score, setScore] = useState(0);
	const [weekEnd, setWeekEnd] = useState(24);
	const [topic, setTopic] = useState<string>("");

	useEffect(() => {
		const load = async () => {
			try {
				const res = await dashboardAPI.getDashboard();
				setTopic(res.data.learning_goal?.topic || "");
			} catch {}
		};
		load();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
		setValue,
	} = useForm<{ difficulty: string }>({
		defaultValues: { difficulty: "easy" },
	});

	const selectedDifficulty = watch("difficulty");

	const difficulties = ["easy", "medium", "hard"];

	const onSubmit = async (data: { difficulty: string }) => {
		setLoading(true);
		try {
			const response = await aiAPI.generateQuiz({
				topic: topic || "general",
				difficulty: data.difficulty,
				week_start: 1,
				week_end: weekEnd,
			});
			setQuiz(response.data);
			setCurrentQuestion(0);
			setSelectedAnswers({});
			setShowResults(false);
			setScore(0);
			toast.success("Quiz generated successfully!");
		} catch (_error: unknown) {
			toast.error("Failed to generate quiz. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
		setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
	};

	const handleNextQuestion = () => {
		if (currentQuestion < (quiz?.questions.length || 0) - 1) {
			setCurrentQuestion((prev) => prev + 1);
		} else {
			calculateScore();
			setShowResults(true);
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestion > 0) setCurrentQuestion((prev) => prev - 1);
	};

	const calculateScore = () => {
		if (!quiz) return;
		let correctAnswers = 0;
		quiz.questions.forEach((q, i) => {
			if (selectedAnswers[i] === q.correct_answer) correctAnswers++;
		});
		setScore(correctAnswers);
	};

	const resetQuiz = () => {
		setQuiz(null);
		setCurrentQuestion(0);
		setSelectedAnswers({});
		setShowResults(false);
		setScore(0);
		reset();
	};

	if (!quiz) {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-black mb-2">Quiz Bomber</h1>
					<p className="text-black/60">
						{topic ? `Topic: ${topic}` : "Topic from your plan"}
					</p>
				</div>

				<div className="bg-white border border-black rounded-2xl p-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{/* Week slider above difficulty */}
						<div>
							<label className="block text-sm font-medium text-black mb-1">
								Weeks to include (1–24)
							</label>
							<div className="flex items-center gap-3">
								<input
									type="range"
									min={1}
									max={24}
									value={weekEnd}
									onChange={(e) => setWeekEnd(Number(e.target.value))}
									className="flex-1"
								/>
								<span className="text-xs text-black/60 w-24 text-right">
									1–{weekEnd}
								</span>
							</div>
							<p className="text-xs text-black/50 mt-1">
								Questions will focus on the themes and tasks covered in these
								weeks.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-black mb-1">
								Difficulty
							</label>
							<div className="grid grid-cols-3 gap-2">
								{difficulties.map((value) => (
									<label key={value} className="relative">
										<input
											{...register("difficulty", {
												required: "Select a difficulty",
											})}
											type="radio"
											value={value}
											checked={selectedDifficulty === value}
											className="sr-only"
											onChange={() =>
												setValue("difficulty", value, { shouldDirty: true })
											}
										/>
										<div
											onClick={() =>
												setValue("difficulty", value, { shouldDirty: true })
											}
											className={`p-2 border border-black rounded-lg text-center cursor-pointer ${
												selectedDifficulty === value
													? "bg-black text-white"
													: "bg-white"
											}`}
										>
											<span className="text-xs font-medium capitalize">
												{value}
											</span>
										</div>
									</label>
								))}
							</div>
							{errors.difficulty && (
								<p className="mt-1 text-xs text-red-600">
									{errors.difficulty.message}
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-black text-white py-2 px-3 rounded-lg font-medium disabled:opacity-50"
						>
							{loading ? (
								<div className="flex items-center justify-center">
									<FiLoader className="animate-spin w-4 h-4 mr-2" />
									Generating...
								</div>
							) : (
								"Generate Quiz"
							)}
						</button>
					</form>
				</div>
			</div>
		);
	}

	if (showResults) {
		const percentage = Math.round((score / quiz.questions.length) * 100);

		return (
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-6">
					<h1 className="text-2xl font-bold text-black mb-2">Quiz Complete!</h1>
					<div className="bg-white border border-black rounded-2xl p-6">
						<div className="mb-4">
							<div className="text-5xl font-bold text-black mb-1">
								{percentage}%
							</div>
							<p className="text-black/60">
								You scored {score} out of {quiz.questions.length}
							</p>
						</div>

						<div className="space-y-2 mb-6">
							{quiz.questions.map((question, index) => {
								const userAnswer = selectedAnswers[index];
								const correct = userAnswer === question.correct_answer;
								return (
									<div
										key={index}
										className={`p-3 rounded-lg border ${
											correct ? "border-green-300" : "border-red-300"
										}`}
									>
										<div className="flex items-start space-x-2">
											{correct ? (
												<FiCheck className="w-4 h-4 text-green-600 mt-0.5" />
											) : (
												<FiX className="w-4 h-4 text-red-600 mt-0.5" />
											)}
											<div className="flex-1">
												<p className="font-medium text-black mb-1">
													{question.question}
												</p>
												<div className="space-y-1">
													{question.options.map((option, optionIndex) => {
														const isRight =
															optionIndex === question.correct_answer;
														const isUserWrong =
															optionIndex === userAnswer && !isRight;
														const cls = isRight
															? "bg-green-100 text-green-800"
															: isUserWrong
															? "bg-red-100 text-red-800"
															: "bg-gray-100 text-black";
														return (
															<div
																key={optionIndex}
																className={`text-sm p-1.5 rounded ${cls}`}
															>
																{String.fromCharCode(65 + optionIndex)}.{" "}
																{option}
															</div>
														);
													})}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>

						<div className="flex space-x-3">
							<button
								onClick={resetQuiz}
								className="flex-1 bg-black text-white py-2 px-3 rounded-lg"
							>
								New Quiz
							</button>
							<button
								onClick={() => {
									setShowResults(false);
									setCurrentQuestion(0);
								}}
								className="flex-1 border border-black text-black py-2 px-3 rounded-lg"
							>
								Review Answers
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const currentQ = quiz.questions[currentQuestion];
	const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

	return (
		<div className="max-w-3xl mx-auto">
			<div className="flex justify-between items-center mb-4">
				<div>
					<h1 className="text-xl font-bold text-black">Quiz: {quiz.topic}</h1>
					<p className="text-black/60 capitalize text-sm">
						{quiz.difficulty} • Q{currentQuestion + 1}/{quiz.questions.length}
					</p>
				</div>
				<button
					onClick={resetQuiz}
					className="text-black hover:underline flex items-center space-x-2 text-sm"
				>
					<FiRefreshCw className="w-4 h-4" />
					<span>New Quiz</span>
				</button>
			</div>

			<div className="mb-4">
				<div className="w-full bg-gray-200 rounded-full h-1">
					<div
						className="bg-black h-1 rounded-full transition-all duration-300"
						style={{ width: `${progress}%` }}
					></div>
				</div>
				<p className="text-xs text-black/60 mt-1">
					{Math.round(progress)}% Complete
				</p>
			</div>

			<div className="bg-white border border-black rounded-2xl p-6">
				<h2 className="text-lg font-semibold text-black mb-4">
					{currentQ.question}
				</h2>
				<div className="space-y-2 mb-6">
					{currentQ.options.map((option, index) => (
						<label
							key={index}
							className={`block p-3 border border-black rounded-lg cursor-pointer ${
								selectedAnswers[currentQuestion] === index
									? "bg-black text-white"
									: "bg-white"
							}`}
						>
							<input
								type="radio"
								name={`question-${currentQuestion}`}
								value={index}
								checked={selectedAnswers[currentQuestion] === index}
								onChange={() => handleAnswerSelect(currentQuestion, index)}
								className="sr-only"
							/>
							<div className="flex items-center">
								<span className="font-medium text-sm">
									{String.fromCharCode(65 + index)}. {option}
								</span>
							</div>
						</label>
					))}
				</div>
				<div className="flex justify-between">
					<button
						onClick={handlePreviousQuestion}
						disabled={currentQuestion === 0}
						className="px-4 py-2 border border-black rounded-lg text-black disabled:opacity-50"
					>
						Previous
					</button>
					<button
						onClick={handleNextQuestion}
						disabled={selectedAnswers[currentQuestion] === undefined}
						className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
					>
						{currentQuestion === quiz.questions.length - 1
							? "Finish Quiz"
							: "Next Question"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default QuizBomber;
