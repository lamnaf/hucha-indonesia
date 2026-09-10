import * as React from "react";

/**
 * Hidden spam-deterrent field (blueprint §32). Humans never fill it in;
 * bots that do are ignored by the mock submit path and later rejected by
 * the real lead endpoint once backend integration lands.
 */
function HoneypotField() {
  return (
    <div aria-hidden="true" className="hidden">
      <label htmlFor="website">Jangan diisi jika Anda manusia</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

export { HoneypotField };
