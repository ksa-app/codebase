import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "../features/auth/AuthContext";
import LoginPage from "../features/auth/LoginPage";
import { AppShell } from "../components/layout/AppShell";

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

// Decides whether to show the login screen, a loading state, or the real app.
// Keeping this separate from AppShell means AppShell can assume a logged-in
// user always exists — no null-checks scattered through every page.
function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={22} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return <AppShell />;
}
