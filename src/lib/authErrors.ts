/**
 * Maps raw auth/backend errors to calm, human-friendly messages.
 * Keeps technical details out of the UI.
 */
export function friendlyAuthError(message?: string | null): string {
  if (!message) return "Something went wrong. Please try again.";
  const m = message.toLowerCase();

  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "That email and password don't match. Please try again.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (m.includes("user already registered") || m.includes("already exists"))
    return "An account with this email already exists.";
  if (m.includes("password") && m.includes("6"))
    return "Password must be at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch"))
    return "We're having trouble connecting. Try again shortly.";
  if (m.includes("not configured"))
    return "The app isn't connected to a backend yet.";

  return "Something went wrong. Please try again.";
}

/** Generic data-layer error message (no raw text exposed). */
export function friendlyDataError(): string {
  return "We're having trouble loading your data. Try again shortly.";
}
