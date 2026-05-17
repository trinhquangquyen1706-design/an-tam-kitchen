"use client";

import {
  AlertCircle,
  CheckCircle2,
  Leaf,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/foundation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserFromAuthResponse, signup } from "@/lib/api/auth";
import { setAuthHint } from "@/lib/auth-session";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const signupPayload = await signup(name, email, password);
      const signedUpUser = getUserFromAuthResponse(signupPayload);

      if (signedUpUser) {
        setAuthHint({ name, email, ...signedUpUser });
        setMessage("Đăng ký thành công! Đang chuyển đến bảng điều khiển...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
        return;
      }

      setMessage("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Leaf aria-hidden="true" className="size-7" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-foreground">
                Tạo tài khoản mới
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bắt đầu quản lý tủ lạnh thông minh cùng Bếp An Tâm
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đăng ký</CardTitle>
              <CardDescription>
                Điền thông tin bên dưới để tạo tài khoản
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-4"
                id="signup-form"
                onSubmit={handleSubmit}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name">
                    <User className="size-3.5 text-muted-foreground" />
                    Họ tên
                  </Label>
                  <Input
                    autoComplete="name"
                    disabled={isLoading}
                    id="signup-name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    type="text"
                    value={name}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">
                    <Mail className="size-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    autoComplete="email"
                    disabled={isLoading}
                    id="signup-email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Mật khẩu
                  </Label>
                  <Input
                    autoComplete="new-password"
                    disabled={isLoading}
                    id="signup-password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    type="password"
                    value={password}
                  />
                </div>

                {message ? (
                  <div className="flex items-start gap-2 rounded-lg bg-accent/50 p-3 text-sm text-accent-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    <span>{message}</span>
                  </div>
                ) : null}
                {error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <Button className="h-11 w-full" disabled={isLoading} type="submit">
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/login"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
