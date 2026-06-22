import { db } from "../db";
import { users, sessions, scores } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import bcryptjs from "bcryptjs";

export class UsersService {
  /**
   * Mendaftarkan pengguna baru ke dalam sistem.
   * Fungsi ini akan mengecek apakah username (name) sudah terdaftar, melakukan hashing pada password,
   * dan menyimpan data pengguna ke database.
   */
  static async registerUser(data: { name: string; password: string }) {
    // 1. Periksa apakah username sudah terdaftar
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.name, data.name))
      .limit(1);

    if (existingUsers.length > 0) {
      throw new Error("Username sudah terdaftar");
    }

    // 2. Hashing password menggunakan bcryptjs
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // 3. Simpan data user baru ke database
    await db.insert(users).values({
      name: data.name,
      password: hashedPassword,
    });

    return { success: true };
  }

  /**
   * Melakukan proses login pengguna.
   * Fungsi ini akan memvalidasi username (name) dan password. Jika valid, akan meng-generate
   * token sesi unik (UUID) dan menyimpannya di database session.
   */
  static async loginUser(data: { name: string; password: string }) {
    // 1. Cari user di database berdasarkan username (name)
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.name, data.name))
      .limit(1);

    const user = existingUsers[0];
    if (!user) {
      throw new Error("Username atau password salah");
    }

    // 2. Bandingkan password
    const isPasswordValid = await bcryptjs.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Username atau password salah");
    }

    // 3. Generate token UUID
    const token = crypto.randomUUID();

    // 4. Simpan session baru ke database
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
      }
    };
  }

  /**
   * Mengambil data profil pengguna yang sedang login berdasarkan token sesi.
   */
  static async getCurrentUser(token: string) {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    const sessionUser = result[0];
    if (!sessionUser) {
      throw new Error("Unauthorized");
    }

    // Ambil score terbaik user dari tabel scores
    const userScores = await db
      .select({ maxScore: sql<number>`max(${scores.score})` })
      .from(scores)
      .where(eq(scores.userId, sessionUser.id));

    const bestScore = userScores[0]?.maxScore || 0;

    // Hitung rank user secara dinamis
    const [rankRows] = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT user_id, MAX(score) as maxScore 
        FROM scores 
        GROUP BY user_id
      ) as user_max_scores
      WHERE maxScore > (
        SELECT COALESCE(MAX(score), 0) 
        FROM scores 
        WHERE user_id = ${sessionUser.id}
      )
    `);
    const rank = Number((rankRows as any)[0]?.rank || 1);

    return {
      id: sessionUser.id,
      name: sessionUser.name,
      bestScore: Number(bestScore),
      rank: rank,
      created_at: sessionUser.createdAt,
    };
  }

  /**
   * Melakukan proses logout dengan menghapus data sesi dari database.
   */
  static async logoutUser(token: string) {
    const [result] = await db.delete(sessions).where(eq(sessions.token, token));
    if (result.affectedRows === 0) {
      throw new Error("Unauthorized");
    }
  }

  /**
   * Menyimpan skor permainan baru ke tabel scores.
   */
  static async submitScore(userId: number, score: number) {
    await db.insert(scores).values({
      userId,
      score,
    });
    return { success: true };
  }

  /**
   * Mengambil top 10 pemain dengan skor tertinggi secara descending.
   */
  static async getLeaderboard() {
    const result = await db
      .select({
        name: users.name,
        bestScore: sql<number>`max(${scores.score})`.as("bestScore"),
      })
      .from(users)
      .innerJoin(scores, eq(users.id, scores.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`max(${scores.score})`))
      .limit(10);

    return result;
  }
}


