import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  secret: "schema-generation-only-secret-32-chars",
  plugins: [organization()],
});
