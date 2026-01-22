import { useState, useEffect } from "react";
import UnlockPage from "./UnlockPage";
import CompanionPage from "./CompanionPage";
import ReflectionsPage from "./ReflectionsPage";
import { introspectToken } from "./api";

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [hasCompanion, setHasCompanion] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    introspectToken(token).then((info) => {
      if (info.ok) setUnlocked(true);
    });
  }, []);

  if (!unlocked) {
    return <UnlockPage onUnlock={() => setUnlocked(true)} />;
  }

  if (!hasCompanion) {
    return <CompanionPage onReady={() => setHasCompanion(true)} />;
  }

  return <ReflectionsPage />;
}

export default App;
