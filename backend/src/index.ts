import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(cors()) // Mengaktifkan CORS agar dapat diakses dari browser frontend
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Brushcat Game RESTful API",
          version: "1.0.0",
          description: "API Documentation untuk backend game Brushcat",
        },
      },
    })
  )
  .use(usersRoute)
  .get("/", () => ({ message: "Brushcat Game API Server is running!" }));

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT || 3000);
  console.log(
    `🚀 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export { app };
export type App = typeof app;

