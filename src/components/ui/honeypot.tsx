"use client";

import { useId } from "react";

/**
 * A hidden honeypot field that is invisible to users but fills bots.
 * If the hidden field has a value on submit, the request is likely spam.
 * Wrap your form with `<HoneypotField />` inside it.
 */
export function HoneypotField() {
  const id = useId();
  return (
    <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      <label htmlFor={id}>Do not fill this field</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
