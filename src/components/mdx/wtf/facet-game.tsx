'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { facetQuestions } from './data';

type FacetAnswer = 'interested-in' | 'similar-to';

export const FacetGame = () => {
  const [answers, setAnswers] = useState<Record<number, FacetAnswer>>({});

  const score = facetQuestions.filter(
    (question, index) => answers[index] === question.answer,
  ).length;

  return (
    <section className="my-8 overflow-hidden rounded-lg border border-line-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle p-4 md:p-5">
        <div>
          <p className="text-xs font-medium text-muted">
            Quick classification game
          </p>
          <h4 className="mt-1 text-lg font-medium tracking-tight md:text-xl">
            Interested in, or similar to?
          </h4>
        </div>
        <span className="rounded-md border border-line px-3 py-1.5 font-mono text-xs text-muted">
          Score: {score}/{facetQuestions.length}
        </span>
      </div>

      <div className="divide-y divide-line-subtle">
        {facetQuestions.map((question, index) => {
          const chosen = answers[index];
          const isCorrect = chosen === question.answer;

          return (
            <div key={question.example} className="p-4 md:p-5">
              <p className="text-sm leading-relaxed">
                {index + 1}. {question.example}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(['interested-in', 'similar-to'] as const).map((option) => {
                  const isChosen = chosen === option;
                  const isRightAnswer = option === question.answer;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [index]: option }))
                      }
                      className={twMerge(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition',
                        isChosen &&
                          isCorrect &&
                          'border-emerald-500 bg-emerald-500 text-background',
                        isChosen &&
                          !isCorrect &&
                          'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400',
                        !isChosen &&
                          isRightAnswer &&
                          chosen !== undefined &&
                          'border-emerald-500 text-emerald-700 dark:text-emerald-400',
                        !isChosen &&
                          !(isRightAnswer && chosen !== undefined) &&
                          'border-line hover:opacity-80',
                      )}
                    >
                      {option === 'interested-in'
                        ? 'Interested in'
                        : 'Similar to'}
                    </button>
                  );
                })}
              </div>

              {chosen && (
                <p
                  className={twMerge(
                    'mt-3 text-xs leading-relaxed',
                    isCorrect
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400',
                  )}
                >
                  {isCorrect ? 'Correct.' : 'Not quite.'} {question.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
