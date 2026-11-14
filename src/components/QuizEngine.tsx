'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronRight, Award } from 'lucide-react';
import { QuizDeck, QuizQuestion } from '@/lib/types';

interface QuizEngineProps {
  deck: QuizDeck;
}

export default function QuizEngine({ deck }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number | number[]>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);

  const questions = deck.questions;
  const currentQ = questions[currentIdx];

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl">
        <p className="text-stone-500">No questions available in this deck.</p>
      </div>
    );
  }

  const isMultiple = Array.isArray(currentQ.correctAnswer);
  const currentSelected = selectedAnswers[currentIdx];
  const isAnswerSubmitted = submitted[currentIdx];

  const handleOptionClick = (idx: number) => {
    if (isAnswerSubmitted) return;

    if (isMultiple) {
      const currentArr = Array.isArray(currentSelected) ? [...currentSelected] : [];
      const pos = currentArr.indexOf(idx);
      if (pos === -1) {
        currentArr.push(idx);
      } else {
        currentArr.splice(pos, 1);
      }
      setSelectedAnswers({ ...selectedAnswers, [currentIdx]: currentArr.sort() });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [currentIdx]: idx });
    }
  };

  const handleSubmit = () => {
    setSubmitted({ ...submitted, [currentIdx]: true });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmitted({});
    setShowSummary(false);
  };

  // Check correctness
  const isCurrentCorrect = () => {
    const sel = selectedAnswers[currentIdx];
    if (sel === undefined) return false;

    if (isMultiple) {
      const target = currentQ.correctAnswer as number[];
      const chosen = sel as number[];
      if (!Array.isArray(chosen) || chosen.length !== target.length) return false;
      return chosen.every((val, i) => val === target[i]);
    } else {
      return sel === currentQ.correctAnswer;
    }
  };

  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const sel = selectedAnswers[idx];
      if (sel === undefined) return;
      if (Array.isArray(q.correctAnswer)) {
        const target = q.correctAnswer;
        const chosen = sel as number[];
        if (Array.isArray(chosen) && chosen.length === target.length && chosen.every((v, i) => v === target[i])) {
          correctCount++;
        }
      } else {
        if (sel === q.correctAnswer) correctCount++;
      }
    });
    return correctCount;
  };

  if (showSummary) {
    const score = calculateScore();
    const percent = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto p-8 sm:p-12 bg-white border border-stone-200 rounded-3xl shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Award className="w-8 h-8" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Quiz Completed!</h2>
        <p className="text-sm text-stone-500 mb-6">{deck.title}</p>

        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 mb-8 inline-block w-full max-w-sm">
          <div className="text-4xl font-extrabold text-stone-900">{score} / {questions.length}</div>
          <div className="text-xs uppercase font-semibold text-stone-500 mt-1 tracking-wider">{percent}% Score</div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white font-medium text-sm rounded-xl hover:bg-stone-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
            Question {currentIdx + 1} of {questions.length}
          </span>
          {currentQ.subtopic && (
            <span className="ml-3 text-xs text-stone-400 font-medium hidden sm:inline">
              {currentQ.subtopic}
            </span>
          )}
        </div>

        {currentQ.difficulty && (
          <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
            currentQ.difficulty === 'hard' ? 'bg-rose-100 text-rose-800' :
            currentQ.difficulty === 'medium' ? 'bg-amber-100 text-amber-800' :
            'bg-emerald-100 text-emerald-800'
          }`}>
            {currentQ.difficulty}
          </span>
        )}
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
          {currentQ.question}
        </h3>
        {isMultiple && (
          <p className="text-xs text-stone-400 mt-1 italic">Select all that apply</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQ.options.map((opt, idx) => {
          const isSelected = isMultiple
            ? Array.isArray(currentSelected) && currentSelected.includes(idx)
            : currentSelected === idx;

          let optionStyle = 'border-stone-200 bg-white hover:bg-stone-50 hover:border-amber-400 text-stone-800';

          if (isAnswerSubmitted) {
            const isCorrectTarget = isMultiple
              ? (currentQ.correctAnswer as number[]).includes(idx)
              : currentQ.correctAnswer === idx;

            if (isCorrectTarget) {
              optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
            } else if (isSelected && !isCorrectTarget) {
              optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
            } else {
              optionStyle = 'border-stone-200 opacity-60 text-stone-600';
            }
          } else if (isSelected) {
            optionStyle = 'border-amber-600 bg-amber-50/70 text-amber-950 font-medium shadow-2xs';
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={isAnswerSubmitted}
              className={`w-full p-4 rounded-2xl border text-left text-sm sm:text-base transition flex items-start gap-3.5 ${optionStyle}`}
            >
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5 ${
                isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 text-stone-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1 leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation after submission */}
      {isAnswerSubmitted && currentQ.explanation && (
        <div className={`p-5 rounded-2xl mb-8 border text-sm leading-relaxed ${
          isCurrentCorrect() ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-800'
        }`}>
          <div className="flex items-center gap-2 font-semibold mb-1">
            {isCurrentCorrect() ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Incorrect</span>
              </>
            )}
          </div>
          <p className="mt-1 text-stone-700">{currentQ.explanation}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <div className="text-xs text-stone-400">
          Progress: {Object.keys(submitted).length} / {questions.length} answered
        </div>

        <div>
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={currentSelected === undefined || (isMultiple && (currentSelected as number[]).length === 0)}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition shadow-xs"
            >
              <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
