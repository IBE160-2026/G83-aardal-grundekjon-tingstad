"use client";

import { type ReactNode, startTransition, useEffect, useRef, useState } from "react";

import { Button } from "@/shared/ui/button";
import { ChoiceCard } from "@/shared/ui/choice-card";
import { InputField } from "@/shared/ui/input-field";
import { NumberChip } from "@/shared/ui/number-chip";
import { ProgressBar } from "@/shared/ui/progress-bar";

import { completeOnboardingAction } from "../actions";

// Onboarding (Story 2.4, FR2): one question per screen, «Steg N av M», back keeps the answers,
// and the last step makes the plan. The server validates everything again; the checks here only
// make sure each question is answered. The option values match the profile's schema.

type Focus = "strength" | "running";

type Answers = {
  focus?: Focus;
  mainFocus?: string;
  experience?: string;
  goal?: string;
  longestRun: string;
  sessionsPerWeek?: number;
  equipment?: string;
};

type StepId = "focus" | "strength" | "running" | "sessions" | "where";

/** The question screens for a focus; the last step of the flow, the plan, is not listed. */
function stepsFor(focus: Focus | undefined): StepId[] {
  if (focus === "running") return ["focus", "running", "sessions"];
  if (focus === "strength") return ["focus", "strength", "sessions", "where"];
  return ["focus"];
}

const TITLES: Record<StepId, string> = {
  focus: "Hva vil du fokusere på?",
  strength: "Fortell om treningen din",
  running: "Fortell om løpingen din",
  sessions: "Hvor mange økter i uka?",
  where: "Hvor trener du?",
};

const UNEXPECTED = "Vi fikk ikke laget planen. Prøv igjen om litt.";
const LONGEST_RUN_REQUIRED = "Skriv lengste løpetur i km.";

const MAIN_FOCUS_OPTIONS = [
  { value: "upper_body", label: "Overkropp" },
  { value: "lower_body", label: "Underkropp" },
  { value: "full_body", label: "Hele kroppen" },
];
const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Nybegynner" },
  { value: "experienced", label: "Erfaren" },
];
const GOAL_OPTIONS = [
  { value: "5k", label: "Første 5 km" },
  { value: "10k", label: "10 km" },
  { value: "half_marathon", label: "Halvmaraton" },
];
const EQUIPMENT_OPTIONS = [
  { value: "gym", label: "På treningssenter" },
  { value: "home", label: "Hjemme" },
];

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-label text-text">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Choices({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <ChoiceCard
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
        >
          {option.label}
        </ChoiceCard>
      ))}
    </div>
  );
}

export function OnboardingFlow() {
  const [answers, setAnswers] = useState<Answers>({ longestRun: "" });
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [longestRunError, setLongestRunError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const steps = stepsFor(answers.focus);
  const step = steps[stepIndex];
  // The last step of the flow is the plan being made: 5 for strength, 4 for running.
  const total = answers.focus === "running" ? 4 : 5;
  const isLastQuestion = stepIndex === steps.length - 1;

  // Move focus to the heading when the step changes, so keyboard and screen reader users start at
  // the new question. Not on the first render, which would steal focus from the page load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  function update(patch: Partial<Answers>) {
    setAnswers((current) => ({ ...current, ...patch }));
    setError(null);
    setLongestRunError(undefined);
  }

  function chooseFocus(focus: Focus) {
    // A new focus drops the answers that belong to the other one.
    setAnswers({ longestRun: "", focus, sessionsPerWeek: answers.sessionsPerWeek });
    setError(null);
    setLongestRunError(undefined);
  }

  /** Why the current step cannot go on yet, or null when it is answered. */
  function problem(): { message?: string; longestRun?: string } | null {
    switch (step) {
      case "focus":
        return answers.focus ? null : { message: "Velg Styrke eller Løping." };
      case "strength":
        return answers.mainFocus && answers.experience
          ? null
          : { message: "Velg ett alternativ i hvert av de to spørsmålene." };
      case "running":
        if (!answers.goal) return { message: "Velg et mål." };
        return answers.longestRun.trim() ? null : { longestRun: LONGEST_RUN_REQUIRED };
      case "sessions":
        return answers.sessionsPerWeek ? null : { message: "Velg hvor mange økter du vil ha." };
      case "where":
        return answers.equipment ? null : { message: "Velg hvor du trener." };
    }
  }

  function next() {
    if (submittingRef.current) return;
    const issue = problem();
    if (issue) {
      setError(issue.message ?? null);
      setLongestRunError(issue.longestRun);
      return;
    }
    if (!isLastQuestion) {
      setStepIndex(stepIndex + 1);
      return;
    }
    submit();
  }

  function back() {
    if (submittingRef.current || stepIndex === 0) return;
    setError(null);
    setLongestRunError(undefined);
    setStepIndex(stepIndex - 1);
  }

  function submit() {
    // A second press while the first is running does nothing (NFR9).
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    const payload =
      answers.focus === "running"
        ? {
            focus: "running",
            goal: answers.goal,
            longestRun: answers.longestRun,
            sessionsPerWeek: answers.sessionsPerWeek,
          }
        : {
            focus: "strength",
            mainFocus: answers.mainFocus,
            experience: answers.experience,
            sessionsPerWeek: answers.sessionsPerWeek,
            equipment: answers.equipment,
          };
    startTransition(async () => {
      try {
        // On success the action redirects to Uke and never returns here.
        const result = await completeOnboardingAction(payload);
        if (result && !result.ok) {
          submittingRef.current = false;
          setSubmitting(false);
          if (result.fieldErrors?.longestRun) {
            setStepIndex(steps.indexOf("running"));
            setLongestRunError(result.fieldErrors.longestRun);
          } else {
            setError(result.message);
          }
        }
      } catch {
        submittingRef.current = false;
        setSubmitting(false);
        setError(UNEXPECTED);
      }
    });
  }

  if (submitting) {
    return (
      <div className="flex flex-1 flex-col gap-gap-card">
        <ProgressBar label={`Steg ${total} av ${total}`} value={total} max={total} />
        <div
          role="status"
          className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <span
            aria-hidden="true"
            className="size-10 rounded-full border-4 border-border border-t-primary motion-safe:animate-spin"
          />
          <p className="text-title text-text">Lager planen din …</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-gap-card">
      {stepIndex > 0 ? (
        <div>
          <Button variant="text" className="-ml-2" onClick={back}>
            <span aria-hidden="true">‹&nbsp;</span>Tilbake
          </Button>
        </div>
      ) : null}
      <ProgressBar label={`Steg ${stepIndex + 1} av ${total}`} value={stepIndex + 1} max={total} />
      <h1 ref={heading} tabIndex={-1} className="text-display text-text outline-none">
        {TITLES[step]}
      </h1>

      {step === "focus" ? (
        <Group legend="Fokus">
          <div className="flex flex-col gap-2">
            <ChoiceCard
              name="focus"
              value="strength"
              checked={answers.focus === "strength"}
              onChange={() => chooseFocus("strength")}
            >
              <span className="flex flex-col gap-1">
                <span className="text-title">Styrke</span>
                <span className="text-body">Bygg kraft og form, økt for økt.</span>
              </span>
            </ChoiceCard>
            <ChoiceCard
              name="focus"
              value="running"
              checked={answers.focus === "running"}
              onChange={() => chooseFocus("running")}
            >
              <span className="flex flex-col gap-1">
                <span className="text-title">Løping</span>
                <span className="text-body">Løp lenger og gladere, steg for steg.</span>
              </span>
            </ChoiceCard>
          </div>
        </Group>
      ) : null}

      {step === "strength" ? (
        <>
          <Group legend="Hovedfokus">
            <Choices
              name="mainFocus"
              options={MAIN_FOCUS_OPTIONS}
              value={answers.mainFocus}
              onChange={(mainFocus) => update({ mainFocus })}
            />
          </Group>
          <Group legend="Erfaring">
            <Choices
              name="experience"
              options={EXPERIENCE_OPTIONS}
              value={answers.experience}
              onChange={(experience) => update({ experience })}
            />
          </Group>
        </>
      ) : null}

      {step === "running" ? (
        <>
          <Group legend="Mål">
            <Choices
              name="goal"
              options={GOAL_OPTIONS}
              value={answers.goal}
              onChange={(goal) => update({ goal })}
            />
          </Group>
          <InputField
            name="longestRun"
            label="Lengste løpetur så langt (km)"
            inputMode="decimal"
            autoComplete="off"
            value={answers.longestRun}
            onChange={(event) => update({ longestRun: event.target.value })}
            error={longestRunError}
          />
        </>
      ) : null}

      {step === "sessions" ? (
        <Group legend="Antall økter i uka">
          <div className="flex flex-wrap gap-3">
            {[2, 3, 4, 5].map((count) => (
              <NumberChip
                key={count}
                name="sessionsPerWeek"
                value={String(count)}
                checked={answers.sessionsPerWeek === count}
                onChange={() => update({ sessionsPerWeek: count })}
              >
                {count}
              </NumberChip>
            ))}
          </div>
        </Group>
      ) : null}

      {step === "where" ? (
        <Group legend="Treningssted">
          <Choices
            name="equipment"
            options={EQUIPMENT_OPTIONS}
            value={answers.equipment}
            onChange={(equipment) => update({ equipment })}
          />
        </Group>
      ) : null}

      <p role="alert" className="text-label text-error empty:hidden">
        {error}
      </p>
      <div className="flex-1" />
      <Button variant="primary" onClick={next}>
        {isLastQuestion ? "Lag planen" : "Neste"}
      </Button>
    </div>
  );
}
