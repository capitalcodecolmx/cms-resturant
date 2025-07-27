import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/tailwind.css";
import "./styles/index.css";

function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;