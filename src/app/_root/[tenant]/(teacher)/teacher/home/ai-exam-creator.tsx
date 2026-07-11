"use client";

import { useState } from "react";
import { saveExamAction } from "./actions";

interface ClassItem {
  classId: string;
  className: string;
}

interface Question {
  id: number;
  type: "mcq" | "subjective";
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface ExamContent {
  title: string;
  questions: Question[];
}

interface SavedExamItem {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  format: string;
  className: string;
  createdAt: Date;
}

interface Props {
  classes: ClassItem[];
  savedExams: SavedExamItem[];
}

export default function AIExamCreator({ classes, savedExams }: Props) {
  const [subject, setSubject] = useState("Science");
  const [classId, setClassId] = useState(classes[0]?.classId || "");
  const [difficulty, setDifficulty] = useState("Medium");
  const [format, setFormat] = useState("MCQ");

  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<ExamContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.classId === classId);

  const handleGenerate = async () => {
    if (!classId) {
      setError("Please select a class first.");
      return;
    }

    setLoading(true);
    setError(null);
    setExam(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/ai/exam-gen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          gradeLevel: selectedClass?.className || "General",
          difficulty,
          format,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Generation failed");
      }

      setExam(result.data);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!exam || !classId) return;

    try {
      await saveExamAction(
        classId,
        exam.title,
        subject,
        selectedClass?.className || "General",
        difficulty,
        format,
        exam,
      );
      setSuccessMsg("Exam paper saved successfully!");
      setExam(null);
    } catch (e: any) {
      setError(e.message || "Failed to save the exam.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Selection Grid */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">AI Exam Generator</h2>
          <p className="text-sm text-zinc-600">
            Generate formatted, class-aligned tests instantly using Google Gemini AI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label htmlFor="subject-select" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              id="subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Geography">Geography</option>
              <option value="History">History</option>
            </select>
          </div>

          <div>
            <label htmlFor="class-select" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Target Class
            </label>
            <select
              id="class-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
            >
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty-select" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="format-select" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Format
            </label>
            <select
              id="format-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="Subjective">Subjective / Questions</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !classId}
          className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-zinc-300 px-4 py-2.5 text-sm font-semibold text-white transition flex items-center justify-center gap-2"
          aria-busy={loading}
          aria-disabled={!classId || loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing curriculum & drafting questions...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Exam Paper</span>
            </>
          )}
        </button>
      </section>

      {/* Errors / Success alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          ✅ {successMsg}
        </div>
      )}

      {/* Live Preview Container */}
      {exam && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-3">
            <div>
              <span className="text-xs uppercase tracking-[0.12em] font-bold text-sky-700">AI Draft Preview</span>
              <h3 className="text-xl font-bold text-zinc-950 mt-1">{exam.title}</h3>
            </div>
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition"
              aria-label="Save and publish exam"
            >
              <span aria-hidden="true"></span>
              Save & Publish Exam
            </button>
          </div>

          <div className="space-y-4">
            {exam.questions.map((q, idx) => (
              <div key={q.id || idx} className="p-4 bg-zinc-50 border border-zinc-200/60 rounded-xl space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="font-semibold text-zinc-900">
                    Q{idx + 1}. {q.questionText}
                  </div>
                  <span className="shrink-0 rounded-lg bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                    {q.points} Points
                  </span>
                </div>

                {q.type === "mcq" && q.options && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctAnswer === opt || q.correctAnswer === ["A","B","C","D"][oIdx];
                      return (
                        <div
                          key={oIdx}
                          className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-white border-zinc-200 text-zinc-700"
                          }`}
                        >
                          <span className="font-bold mr-1.5">{["A", "B", "C", "D"][oIdx]}.</span> {opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "subjective" && (
                  <div className="text-xs text-zinc-500 font-mono mt-1">
                    💡 Key Guideline: Expected points to cover inside grading keys.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Exams List */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-zinc-950">Published Exam Papers</h2>
        {savedExams.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">No exams published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Grade Level</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Format</th>
                  <th className="pb-3 text-right">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {savedExams.map((ex) => (
                  <tr key={ex.id} className="text-zinc-800">
                    <td className="py-3 font-semibold text-zinc-950">{ex.title}</td>
                    <td className="py-3">{ex.subject}</td>
                    <td className="py-3">{ex.className}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 border border-zinc-200">
                        {ex.difficulty}
                      </span>
                    </td>
                    <td className="py-3">{ex.format}</td>
                    <td className="py-3 text-right text-xs text-zinc-500">
                      {new Date(ex.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
