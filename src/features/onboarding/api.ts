// Public surface of the `onboarding` slice (AD-1). Other code imports this slice only through this file.
// Five-step onboarding that creates the profile and first plan through profile.api and plan.api.
// Every function takes the user id as its first argument and enforces its own rules.

export { completeOnboardingAction } from "./actions";
export { OnboardingFlow } from "./components/onboarding-flow";
