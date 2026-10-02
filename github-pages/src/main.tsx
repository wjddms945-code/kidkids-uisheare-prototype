import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UisheareApp } from "@/components/uisheare/UisheareApp";
import "@/app/globals.css";
import "./pages.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UisheareApp />
  </StrictMode>,
);
