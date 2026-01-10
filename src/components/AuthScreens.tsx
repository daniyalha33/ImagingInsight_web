import { useState } from "react";
import { AdminLoginScreen } from "./AdminLoginScreen";
import { PasswordRecoveryScreen } from "./PasswordRecoveryScreen";

export function AuthScreens() {
  const [screen, setScreen] = useState<"admin" | "recover">("admin");

  return (
    <>
      {screen === "admin" && (
        <AdminLoginScreen
          onLogin={(email, password) => {
            console.log("Login:", email, password);
          }}
          onNavigateToPasswordRecovery={() => setScreen("recover")}
          onSwitchToTeacherLogin={() => console.log("Teacher Login Switch")}
        />
      )}

      {screen === "recover" && (
        <PasswordRecoveryScreen
          onSendResetLink={(email) => {
            console.log("Reset link sent to:", email);
          }}
          onBackToLogin={() => setScreen("admin")}
        />
      )}
    </>
  );
}
