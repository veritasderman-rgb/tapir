import React, { useState, useMemo } from 'react';
import { useTyfovaStore } from '../../store/tyfovaStore';
import { getQuestionsForStep } from '../../data/tyfova/questions';
import type { TyfovaQuestion } from '../../types/didaktikon';

export const QuizPanel: React.FC = () => {
  const currentStep = useTyfovaStore((s) => s.currentStep);
  const answers = useTyfovaStore((s) => s.answers);
  const nextStep = useTyfovaStore((s) => s.nextStep);
  const finishGame = useTyfovaStore((s) => s.finishGame);

  const questions = useMemo(() => getQuestionsForStep(currentStep), [currentStep]);
  const allAnswered = questions.every((q) => q.id in answers);
  const isLastStep = currentStep === 6;

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Otázky — Krok {currentStep + 1}
      </h3>

      {questions.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Pro tento krok nejsou žádné otázky. Přečtěte si dokument a pokračujte
          na další krok.
        </p>
      )}

      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} answered={q.id in answers} />
      ))}

      {allAnswered && (
        <div className="pt-4 border-t border-gray-200">
          {isLastStep ? (
            <button
              onClick={finishGame}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Uzavřít vyšetřování
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Další krok →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface QuestionCardProps {
  question: TyfovaQuestion;
  answered: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, answered }) => {
  const submitAnswer = useTyfovaStore((s) => s.submitAnswer);
  const storedAnswer = useTyfovaStore((s) => s.answers[question.id]);

  const [localAnswer, setLocalAnswer] = useState<string | string[]>(
    question.type === 'checkbox' ? [] : ''
  );
  const [submitted, setSubmitted] = useState(answered);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (submitted) return;
    const correct = submitAnswer(question.id, localAnswer);
    setIsCorrect(correct);
    setSubmitted(true);
  };

  const handleRadioChange = (option: string) => {
    if (submitted) return;
    setLocalAnswer(option);
  };

  const handleCheckboxChange = (option: string) => {
    if (submitted) return;
    setLocalAnswer((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(option)
        ? arr.filter((o) => o !== option)
        : [...arr, option];
    });
  };

  const handleTextChange = (value: string) => {
    if (submitted) return;
    setLocalAnswer(value);
  };

  const canSubmit =
    !submitted &&
    (question.type === 'text'
      ? typeof localAnswer === 'string' && localAnswer.trim().length > 0
      : question.type === 'checkbox'
        ? Array.isArray(localAnswer) && localAnswer.length > 0
        : typeof localAnswer === 'string' && localAnswer.length > 0);

  return (
    <div
      className={`rounded-lg border p-4 ${
        submitted
          ? isCorrect
            ? 'border-green-300 bg-green-50'
            : 'border-red-300 bg-red-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-sm font-medium text-gray-900 mb-3">{question.question}</p>

      {question.hint && !submitted && (
        <p className="text-xs text-gray-500 italic mb-2">Nápověda: {question.hint}</p>
      )}

      {/* Multiple choice */}
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className={`flex items-start gap-2 text-sm cursor-pointer p-2 rounded ${
                submitted
                  ? option === question.correctAnswer
                    ? 'bg-green-100 font-semibold'
                    : option === localAnswer
                      ? 'bg-red-100'
                      : ''
                  : localAnswer === option
                    ? 'bg-indigo-50'
                    : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                checked={localAnswer === option}
                onChange={() => handleRadioChange(option)}
                disabled={submitted}
                className="mt-0.5"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Checkbox */}
      {question.type === 'checkbox' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const correctArr = Array.isArray(question.correctAnswer)
              ? question.correctAnswer
              : [question.correctAnswer];
            const isOptionCorrect = correctArr.includes(option);
            const isChecked = Array.isArray(localAnswer) && localAnswer.includes(option);

            return (
              <label
                key={option}
                className={`flex items-start gap-2 text-sm cursor-pointer p-2 rounded ${
                  submitted
                    ? isOptionCorrect
                      ? 'bg-green-100 font-semibold'
                      : isChecked
                        ? 'bg-red-100'
                        : ''
                    : isChecked
                      ? 'bg-indigo-50'
                      : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(option)}
                  disabled={submitted}
                  className="mt-0.5"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Text input */}
      {question.type === 'text' && (
        <div>
          <input
            type="text"
            value={typeof localAnswer === 'string' ? localAnswer : ''}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={submitted}
            placeholder="Zadejte odpověď..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-100"
          />
          {submitted && (
            <p className="text-xs text-gray-600 mt-1">
              Správná odpověď: <strong>{question.correctAnswer}</strong>
            </p>
          )}
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Odpovědět
        </button>
      )}

      {/* Explanation after submit */}
      {submitted && (
        <div
          className={`mt-3 p-3 rounded text-sm ${
            isCorrect
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <p className="font-semibold mb-1">
            {isCorrect ? '\u2705 Správně!' : '\u274C Nesprávně'}
          </p>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
