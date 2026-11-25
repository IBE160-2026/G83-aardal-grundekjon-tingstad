import type { InputHTMLAttributes } from "react";

// input-field from DESIGN.md: label always above, 1 px text-muted border, error = 2 px error
// border plus an icon and a message under the field, linked with aria-describedby.

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
  name: string;
  label: string;
  error?: string;
  id?: string;
};

export function InputField({
  name,
  label,
  error,
  id = name,
  className,
  ...props
}: InputFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label htmlFor={id} className="text-label text-text">
        {label}
      </label>
      <input
        {...props}
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-tap-button w-full min-w-0 rounded-md bg-surface px-4 text-body text-text ${
          error ? "border-2 border-error" : "border border-text-muted"
        }`}
      />
      {error ? (
        <p id={errorId} className="flex items-start gap-2 text-meta text-error">
          <ErrorIcon />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[1.25em] shrink-0 translate-y-[0.1em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </svg>
  );
}
