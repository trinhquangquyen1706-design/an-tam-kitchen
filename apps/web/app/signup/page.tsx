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
    <div className="flex min-h-dvh bg-background">
      {/* ═══ LEFT: Brand Panel (hidden on mobile) ═══ */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex lg:w-[45%]" style={{ background: 'linear-gradient(145deg, oklch(0.38 0.10 158), oklch(0.30 0.08 158) 60%, oklch(0.25 0.06 170))' }}>
        {/* Decorative radial glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full opacity-20" aria-hidden="true" style={{ background: 'radial-gradient(circle, oklch(0.75 0.12 158 / 0.6), transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-60 rounded-full opacity-15" aria-hidden="true" style={{ background: 'radial-gradient(circle, oklch(0.80 0.10 90 / 0.4), transparent 70%)' }} />

        <Link href="/" className="relative inline-flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Leaf aria-hidden="true" className="size-5" />
          </span>
          <span className="font-heading text-lg font-semibold">Bếp An Tâm</span>
        </Link>

        <div className="relative space-y-4">
          <h2 className="font-heading text-3xl font-bold leading-tight">
            Bắt đầu hành trình giảm lãng phí thực phẩm
          </h2>
          <p className="max-w-md text-base leading-7 text-white/75">
            Tạo tài khoản miễn phí và quản lý tủ lạnh thông minh cùng gia đình.
          </p>
        </div>

        <p className="relative text-sm text-white/50">
          &copy; {new Date().getFullYear()} Bếp An Tâm. BKI Innovation.
        </p>
      </div>

      {/* ═══ RIGHT: Signup Form ═══ */}
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile-only branding */}
          <div className="flex flex-col items-center gap-3 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <Leaf aria-hidden="true" className="size-7" />
              </span>
            </Link>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-foreground">
                Tạo tài khoản mới
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Bắt đầu quản lý tủ lạnh thông minh cùng Bếp An Tâm
              </p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block">
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Tạo tài khoản mới
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bắt đầu quản lý tủ lạnh thông minh cùng Bếp An Tâm
            </p>
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

                <Button className="h-11 w-full active:scale-[0.98]" disabled={isLoading} type="submit">
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
