'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/lib/types';

interface ChapterQuizProps {
  questions?: QuizQuestion[];
  chapterTitle: string;
  chapterCode: string;
}

export default function ChapterQuiz({
  questions = [],
  chapterTitle,
  chapterCode,
}: ChapterQuizProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <ChapterQuizInner
      questions={questions}
      chapterTitle={chapterTitle}
      chapterCode={chapterCode}
    />
  );
}

function ChapterQuizInner({
  questions,
  chapterTitle,
  chapterCode,
}: {
  questions: QuizQuestion[];
  chapterTitle: string;
  chapterCode: string;
}) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedMultiple, setSelectedMultiple] = useState<number[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);

  const storageKey = `chapter_quiz_${chapterCode.toLowerCase()}`;

  const [answers, setAnswers] = useState<Record<string, { selected: number | number[]; isCorrect: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(answers));
      } catch (e) {}
    }
  }, [answers, storageKey]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (!currentQ) return;
    const existing = answers[currentQ.id];
    if (existing) {
      if (Array.isArray(existing.selected)) {
        setSelectedMultiple(existing.selected);
        setSelectedOption(null);
      } else {
        setSelectedOption(existing.selected);
        setSelectedMultiple([]);
      }
      setIsAnswerChecked(true);
    } else {
      setSelectedOption(null);
      setSelectedMultiple([]);
      setIsAnswerChecked(false);
    }
  }, [currentIndex, currentQ, answers]);

  if (!currentQ) return null;

  const isMultiple = Array.isArray(currentQ.correctAnswer);

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    if (isMultiple) {
      setSelectedMultiple((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    } else {
      setSelectedOption(idx);
    }
  };

  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (isMultiple) {
      const correctArr = (currentQ.correctAnswer as number[]).slice().sort();
      const userArr = selectedMultiple.slice().sort();
      isCorrect =
        correctArr.length === userArr.length &&
        correctArr.every((val, i) => val === userArr[i]);
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: { selected: selectedMultiple, isCorrect },
      }));
    } else {
      isCorrect = selectedOption === currentQ.correctAnswer;
      if (selectedOption !== null) {
        setAnswers((prev) => ({
          ...prev,
          [currentQ.id]: { selected: selectedOption, isCorrect },
        }));
      }
    }
    setIsAnswerChecked(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;

  return (
    <section className="chapter-quiz-card" id="chapter-assessment">
      <div className="cqc-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="cqc-title-group">
          <span className="cqc-icon">🎯</span>
          <div>
            <h3>Chapter Assessment: Active Recall</h3>
            <p className="cqc-subtitle">
              {questions.length} high-yield clinical questions mapped to Chapter {chapterCode}
            </p>
          </div>
        </div>

        <div className="cqc-stats-group">
          {answeredCount > 0 && (
            <span className="cqc-score-pill">
              {correctCount} / {answeredCount} Correct
            </span>
          )}
          <button
            type="button"
            className="cqc-toggle-btn"
            aria-expanded={isExpanded}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Collapse ▲' : 'Take Quiz ▼'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="cqc-body">
          <div className="cqc-progress-bar-container">
            <div
              className="cqc-progress-bar-fill"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="cqc-meta-row">
            <span className="cqc-q-num">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className={`cqc-difficulty cqc-diff-${currentQ.difficulty || 'medium'}`}>
              {currentQ.difficulty || 'medium'}
            </span>
          </div>

          <p className="cqc-question-text">{currentQ.question}</p>

          <div className="cqc-options-list">
            {currentQ.options.map((opt, idx) => {
              const isSelected = isMultiple
                ? selectedMultiple.includes(idx)
                : selectedOption === idx;

              let stateClass = '';
              if (isAnswerChecked) {
                const isTarget = isMultiple
                  ? (currentQ.correctAnswer as number[]).includes(idx)
                  : currentQ.correctAnswer === idx;

                if (isTarget) stateClass = 'cqc-opt-correct';
                else if (isSelected && !isTarget) stateClass = 'cqc-opt-wrong';
                else stateClass = 'cqc-opt-dim';
              } else if (isSelected) {
                stateClass = 'cqc-opt-selected';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={`cqc-option-btn ${stateClass}`}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerChecked}
                >
                  <span className="cqc-opt-marker">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="cqc-opt-label">{opt}</span>
                </button>
              );
            })}
          </div>

          {isAnswerChecked && currentQ.explanation && (
            <div className="cqc-explanation-box">
              <div className="cqc-exp-title">
                {answers[currentQ.id]?.isCorrect ? '✓ Correct Analysis' : '✕ Diagnostic Feedback'}
              </div>
              <p className="cqc-exp-text">{currentQ.explanation}</p>
            </div>
          )}

          <div className="cqc-footer-nav">
            <button
              type="button"
              className="cqc-nav-btn"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>

            {!isAnswerChecked ? (
              <button
                type="button"
                className="cqc-check-btn"
                onClick={handleCheckAnswer}
                disabled={
                  isMultiple ? selectedMultiple.length === 0 : selectedOption === null
                }
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                className="cqc-next-btn"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
              >
                Next Question →
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
