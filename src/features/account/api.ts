// Public surface of the `account` slice (AD-1). Other code imports this slice only through this file.
// Owns the Better Auth tables, the demo users and the coach usage counter (AD-3).

export { loginAction, logoutAction, registerAction } from "./actions";
export { LoginForm } from "./components/login-form";
export { LogoutButton } from "./components/logout-button";
export { RegisterForm } from "./components/register-form";
export { deleteDemoUser, deleteStaleDemoUsers, signUpDemoUser } from "./demo";
