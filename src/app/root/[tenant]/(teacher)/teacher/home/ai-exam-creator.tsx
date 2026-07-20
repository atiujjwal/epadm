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
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save the exam.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Parameter Selection Grid */}
      <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
        <div>
          <h2 className="text-sm font-semibold text-primary">AI exam creator</h2>
          <p className="text-xs text-secondary">
            Generate formatted, class-aligned tests instantly using Google Gemini AI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label htmlFor="subject-select" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              id="subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-xs"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
            >
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Geography">Geography</option>
              <option value="History">History</option>
            </select>
          </div>

          <div>
            <label htmlFor="class-select" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Target Class
            </label>
            <select
              id="class-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-xs"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
            >
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>
                  {c.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty-select" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-xs"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label htmlFor="format-select" className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Format
            </label>
            <select
              id="format-select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-xs"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
            >
              <option value="MCQ">Multiple Choice (MCQ)</option>
              <option value="Subjective">Subjective / Questions</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !classId}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#3f5ca8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#344e91] disabled:bg-zinc-300"
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
              <span>Generate exam paper</span>
            </>
          )}
        </button>
      </section>

      {/* Errors / Success alerts */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
          ✅ {successMsg}
        </div>
      )}

      {/* Live Preview Container */}
      {exam && (
        <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3" style={{ borderColor: "var(--border-default)" }}>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#3f5ca8]">AI draft preview</span>
              <h3 className="mt-1 text-base font-bold text-primary">{exam.title}</h3>
            </div>
            <button
              onClick={handleSave}
              className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              aria-label="Save and publish exam"
            >
              Save and publish exam
            </button>
          </div>

          <div className="space-y-4">
            {exam.questions.map((q, idx) => (
              <div 
                key={q.id || idx} 
                className="space-y-3 rounded-md border p-3"
                style={{ backgroundColor: "var(--bg-surface-2)", borderColor: "var(--border-default)" }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="font-semibold text-primary">
                    Q{idx + 1}. {q.questionText}
                  </div>
                  <span className="shrink-0 rounded-lg bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                    {q.points} points
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
                  <div className="text-xs text-muted font-mono mt-1">
                    💡 Key Guideline: Expected points to cover inside grading keys.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Exams List */}
      <section className="space-y-4 rounded-md border p-4 shadow-[0_1px_2px_rgba(23,30,44,.04)]" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}>
        <h2 className="text-sm font-semibold text-primary">Published exam papers</h2>
        {savedExams.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No exams published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold text-muted uppercase" style={{ borderColor: "var(--border-default)" }}>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Grade Level</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Format</th>
                  <th className="pb-3 text-right">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-default)" }}>
                {savedExams.map((ex) => (
                  <tr key={ex.id} className="text-secondary">
                    <td className="py-3 font-semibold text-primary">{ex.title}</td>
                    <td className="py-3">{ex.subject}</td>
                    <td className="py-3">{ex.className}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 border border-zinc-200">
                        {ex.difficulty}
                      </span>
                    </td>
                    <td className="py-3">{ex.format}</td>
                    <td className="py-3 text-right text-xs text-muted">
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
