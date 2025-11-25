import { execSync } from "child_process";

try {
  execSync("husky install", { stdio: "inherit" });
} catch (error) {
  console.error("Error al instalar husky:", error);
}

