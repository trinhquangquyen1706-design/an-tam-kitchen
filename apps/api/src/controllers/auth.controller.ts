import { Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { userRepository } from "../container.js";
import { UserSchema } from "@repo/types";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET || "fallback-refresh-secret-for-dev";


const SignupSchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
});

const LoginSchema = UserSchema.pick({
  email: true,
  password: true,
});

const ForgotPasswordSchema = z.object({
  email: z.email(),
});

const ResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedBody = SignupSchema.parse(req.body);

    const existingUser = await userRepository.findByEmail(parsedBody.email);

    if (existingUser) {
      // Generic error để tránh user enumeration
      return res
        .status(400)
        .json({ error: "Signup failed. User may already exist." });
    }

    const hashedPassword = await argon2.hash(parsedBody.password);

    const newUser = await userRepository.create({
      email: parsedBody.email,
      password: hashedPassword,
      name: parsedBody.name,
    });

    return res
      .status(201)
      .json({
        message: "User created successfully",
        userId: newUser.id,
        user: {
          id: newUser.id,
          name: newUser.name ?? undefined,
          email: newUser.email,
        },
      });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.issues });
    }
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedBody = LoginSchema.parse(req.body);

    const user = await userRepository.findByEmail(parsedBody.email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await argon2.verify(user.password, parsedBody.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Lưu refresh token vào DB
    await userRepository.update(user.id, { refreshToken });

    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProd, // Chỉ bắt buộc Secure (HTTPS) khi ở Production
      sameSite: isProd ? "none" : "lax", // Lax là đủ cho localhost
      maxAge: 15 * 60 * 1000,
    };

    res.cookie("accessToken", accessToken, cookieOptions);

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name ?? undefined,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: error.issues });
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {
          userId: string;
        };
        await userRepository.update(decoded.userId, { refreshToken: null });
      } catch (_err) {
        // Token không hợp lệ/hết hạn → vẫn xoá cookie, bỏ qua lỗi DB
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    const clearOptions: any = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    };

    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);
    const user = await userRepository.findByEmail(email);

    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu." });
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: "reset" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // TODO: Send real email here. For now, log to console.
    console.log(`[FORGOT PASSWORD] Link: http://localhost:3000/reset-password?token=${resetToken}`);

    return res.status(200).json({ message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Email không hợp lệ" });
    }
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, newPassword } = ResetPasswordSchema.parse(req.body);

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };

    if (decoded.type !== "reset") {
      return res.status(400).json({ error: "Token không hợp lệ" });
    }

    const hashedPassword = await argon2.hash(newPassword);
    await userRepository.update(decoded.userId, { password: hashedPassword });

    return res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công." });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: "Token đã hết hạn" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: "Token không hợp lệ" });
    }
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const guestLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const guestId = Math.random().toString(36).substring(7);
    const guestEmail = `guest_${guestId}@beptantam.vn`;
    const guestName = `Khách ${guestId}`;
    const guestPassword = await argon2.hash(Math.random().toString(36));

    const user = await userRepository.create({
      email: guestEmail,
      name: guestName,
      password: guestPassword,
    });

    // ── Seed demo inventory items for guest ──
    const { inventoryRepository, productRepository } = await import("../container.js");
    const now = new Date();
    const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);
    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

    const demoProducts = [
      { name: "Sữa tươi", category: "dairy" as const, company: "An Tam Demo", daysBeforeOpen: 7, daysAfterOpen: 5, isGlobal: false, ownerId: user.id },
      { name: "Tương cà", category: "sauces_spices" as const, company: "An Tam Demo", daysBeforeOpen: 180, daysAfterOpen: 30, isGlobal: false, ownerId: user.id },
      { name: "Xúc xích", category: "meat_poultry" as const, company: "An Tam Demo", daysBeforeOpen: 10, daysAfterOpen: 4, isGlobal: false, ownerId: user.id },
    ];

    const products = await Promise.all(demoProducts.map(p => productRepository.create(p)));

    const demoItems = [
      { userId: user.id, userProductId: products[0].id, displayName: "Sữa tươi", openedAt: subDays(now, 4), expiryDate: addDays(now, 2), location: "fridge" as const, status: "use_soon" as const, notes: "Dùng cho bữa sáng hoặc pha cà phê.", quantity: "1 hộp" },
      { userId: user.id, userProductId: products[1].id, displayName: "Tương cà", openedAt: subDays(now, 4), expiryDate: addDays(now, 18), location: "room_temp" as const, status: "fresh" as const, notes: "Để ở kệ gia vị sau khi dùng.", quantity: "1 chai" },
      { userId: user.id, userProductId: products[2].id, displayName: "Xúc xích", openedAt: subDays(now, 5), expiryDate: addDays(now, 1), location: "fridge" as const, status: "check_before_use" as const, notes: "Đã mở gói, nên xem lại trước khi chế biến.", quantity: "300g" },
    ];

    await Promise.all(demoItems.map(item => inventoryRepository.create(item)));

    const accessToken = jwt.sign({ userId: user.id, isGuest: true }, JWT_SECRET, {
      expiresIn: "2h",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Đăng nhập với tư cách khách thành công", user: { id: user.id, name: user.name, email: user.email, isGuest: true } });
  } catch (error) {
    console.error("Guest login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
