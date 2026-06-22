import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

const loginAttempts = new Map<string, { attempts: number; lockUntil: number }>();

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .get(
    "/leaderboard",
    async ({ set }) => {
      try {
        const result = await UsersService.getLeaderboard();
        set.status = 200;
        return { data: result };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message || "Internal Server Error" };
      }
    },
    {
      response: {
        200: t.Object({
          data: t.Array(
            t.Object({
              name: t.String(),
              bestScore: t.Any(),
            })
          ),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    }
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await UsersService.registerUser({
          name: body.name,
          password: body.password,
        });
        
        set.status = 201; // Created
        return { data: "OK" };
      } catch (error: any) {
        if (error.message === "Username sudah terdaftar") {
          set.status = 400; // Bad Request
          return { error: "Username sudah terdaftar" };
        }
        
        set.status = 500; // Internal Server Error
        return { error: error.message || "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 3, maxLength: 100, pattern: "^[a-zA-Z0-9_]+$" }),
        password: t.String({ minLength: 4, maxLength: 255 }),
      }),
      response: {
        201: t.Object({
          data: t.String(),
        }),
        400: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    }
  )
  .post(
    "/login",
    async ({ body, set, request }) => {
      const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const now = Date.now();
      const record = loginAttempts.get(clientIp);

      if (record && record.attempts >= 5 && record.lockUntil > now) {
        set.status = 429; // Too Many Requests
        const minutesLeft = Math.ceil((record.lockUntil - now) / 60000);
        return { error: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${minutesLeft} menit.` };
      }

      try {
        const authData = await UsersService.loginUser({
          name: body.name,
          password: body.password,
        });
        
        // Reset rate limiter on success
        loginAttempts.delete(clientIp);

        set.status = 200; // OK
        return { data: authData };
      } catch (error: any) {
        // Increment rate limiter on failure
        const failedRecord = loginAttempts.get(clientIp) || { attempts: 0, lockUntil: 0 };
        if (failedRecord.lockUntil < now) {
          failedRecord.attempts = 1;
        } else {
          failedRecord.attempts += 1;
        }

        if (failedRecord.attempts >= 5) {
          failedRecord.lockUntil = now + 15 * 60 * 1000; // 15 mins lock
        }
        loginAttempts.set(clientIp, failedRecord);

        if (error.message === "Username atau password salah") {
          set.status = 400; // Bad Request
          return { error: "Username atau password salah" };
        }
        
        set.status = 500; // Internal Server Error
        return { error: error.message || "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 3, maxLength: 100, pattern: "^[a-zA-Z0-9_]+$" }),
        password: t.String({ minLength: 4, maxLength: 255 }),
      }),
      response: {
        200: t.Object({
          data: t.Object({
            token: t.String(),
            user: t.Object({
              id: t.Numeric(),
              name: t.String(),
            }),
          }),
        }),
        400: t.Object({
          error: t.String(),
        }),
        429: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    }
  )
  .group("", (app) =>
    app
      .derive(({ headers }) => {
        const authHeader = headers["authorization"];
        const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        return { token };
      })
      .onBeforeHandle(({ token, set }) => {
        if (!token) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      })
      .get(
        "/current",
        async ({ token, set }) => {
          try {
            const user = await UsersService.getCurrentUser(token as string);
            set.status = 200;
            return { data: user };
          } catch (error: any) {
            if (error.message === "Unauthorized") {
              set.status = 401;
              return { error: "Unauthorized" };
            }

            set.status = 500;
            return { error: error.message || "Internal Server Error" };
          }
        },
        {
          response: {
            200: t.Object({
              data: t.Object({
                id: t.Numeric(),
                name: t.String(),
                bestScore: t.Numeric(),
                rank: t.Numeric(),
                created_at: t.Any(),
              }),
            }),
            401: t.Object({
              error: t.String(),
            }),
            500: t.Object({
              error: t.String(),
            }),
          },
        }
      )
      .delete(
        "/logout",
        async ({ token, set }) => {
          try {
            await UsersService.logoutUser(token as string);
            set.status = 200;
            return { data: "OK" };
          } catch (error: any) {
            if (error.message === "Unauthorized") {
              set.status = 401;
              return { error: "Unauthorized" };
            }

            set.status = 500;
            return { error: error.message || "Internal Server Error" };
          }
        },
        {
          response: {
            200: t.Object({
              data: t.String(),
            }),
            401: t.Object({
              error: t.String(),
            }),
            500: t.Object({
              error: t.String(),
            }),
          },
        }
      )
      .post(
        "/score",
        async ({ token, body, set }) => {
          try {
            const user = await UsersService.getCurrentUser(token as string);
            await UsersService.submitScore(user.id, body.score);
            set.status = 200;
            return { data: "OK" };
          } catch (error: any) {
            if (error.message === "Unauthorized") {
              set.status = 401;
              return { error: "Unauthorized" };
            }
            set.status = 500;
            return { error: error.message || "Internal Server Error" };
          }
        },
        {
          body: t.Object({
            score: t.Number(),
          }),
          response: {
            200: t.Object({
              data: t.String(),
            }),
            401: t.Object({
              error: t.String(),
            }),
            500: t.Object({
              error: t.String(),
            }),
          },
        }
      )
  );


