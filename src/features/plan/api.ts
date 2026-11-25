// Public surface of the `plan` slice (AD-1). Other code imports this slice only through this file.
// Owns programs, plan weeks, versions and session slots (AD-3, AD-7, AD-8). Filled from Epic 2.
// Every function takes the user id as its first argument and enforces its own rules.
// Empty until the stories that own this slice add their commands and queries.

export {};
