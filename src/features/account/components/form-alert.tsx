import type { Ref } from "react";

import { ErrorIcon } from "@/shared/ui/input-field";

/** Form-level error (for example a wrong login), announced with role="alert". */
export function FormAlert({
  message,
  ref,
}: {
  message: string | null;
  ref: Ref<HTMLParagraphElement>;
}) {
  return (
    <div role="alert" aria-atomic="true">
      {message ? (
        <p ref={ref} tabIndex={-1} className="flex items-start gap-2 text-body text-error">
          <ErrorIcon />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}
