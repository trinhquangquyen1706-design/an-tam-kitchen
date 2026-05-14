"use client";

import {
  AlertCircle,
  CheckCircle2,
  Leaf,
  Loader2,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { AppHeader } from "@/components/foundation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserFromAuthResponse, login, guestLogin } from "@/lib/api/auth";
import { getSafeNextPath, setAuthHint } from "@/lib/auth-session";



function subscribeToLocationSearch() {
  return () => {};
}

function getLocationSearchSnapshot() {
  return window.location.search;
}

function getServerLocationSearchSnapshot() {
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const locationSearch = useSyncExternalStore(
    subscribeToLocationSearch,
    getLocationSearchSnapshot,
    getServerLocationSearchSnapshot
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const searchParams = new URLSearchParams(locationSearch);
  const safeNext = getSafeNextPath(searchParams.get("next"));
  const authRequiredMessage =
    searchParams.get("reason") === "auth-required"
      ? "Bạn cần đăng nhập để sử dụng tính năng này."
      : "";

  async function handleLogin(
    loginEmail: string,
    loginPassword: string,
    isGuest = false
  ) {
    setMessage("");
    setError("");

    if (isGuest) {
      setIsGuestLoading(true);
    } else {
      setIsLoading(true);
    }

    try {
      const loginPayload = await login(loginEmail, loginPassword);
      setAuthHint(
        getUserFromAuthResponse(loginPayload) ??
          (isGuest
            ? { email: loginEmail, name: "Tài khoản khách" }
            : { email: loginEmail })
      );
      setMessage("Đăng nhập thành công! Đang chuyển tiếp...");
      setTimeout(() => {
        router.push(safeNext ?? "/");
      }, 1000);
    } catch (err) {
      if (isGuest) {
        setError(
          "Tài khoản khách chưa được bật trên backend. Vui lòng chạy seed guest hoặc thử lại sau."
        );
      } else {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsGuestLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleLogin(email, password);
  }

  async function handleGuestLogin() {
    setMessage("");
    setError("");
    setIsGuestLoading(true);

    try {
      const payload = await guestLogin();
      setAuthHint(
        getUserFromAuthResponse(payload) ?? {
          name: "Tài khoản khách",
        }
      );
      setMessage("Đăng nhập khách thành công!");
      router.push(safeNext ?? "/");
    } catch {
      setError(
        "Không thể tạo tài khoản khách. Vui lòng thử lại sau."
      );
    } finally {
      setIsGuestLoading(false);
    }
  }

  const anyLoading = isLoading || isGuestLoading;

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
                Chào mừng trở lại!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Đăng nhập để quản lý tủ lạnh của bạn
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đăng nhập</CardTitle>
              <CardDescription>
                Sử dụng email và mật khẩu của bạn
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-4"
                id="login-form"
                onSubmit={handleSubmit}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">
                    <Mail className="size-3.5 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    autoComplete="email"
                    disabled={anyLoading}
                    id="login-email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">
                      <Lock className="size-3.5 text-muted-foreground" />
                      Mật khẩu
                    </Label>
                    <Link
                      className="text-xs text-primary hover:underline"
                      href="/forgot-password"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input
                    autoComplete="current-password"
                    disabled={anyLoading}
                    id="login-password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                {authRequiredMessage ? (
                  <div className="flex items-start gap-2 rounded-lg bg-accent/50 p-3 text-sm text-accent-foreground">
                    <Lock className="mt-0.5 size-4 shrink-0" />
                    <span>{authRequiredMessage}</span>
                  </div>
                ) : null}
                {error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <Button className="h-11 w-full" disabled={anyLoading} type="submit">
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <div className="flex w-full items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">hoặc</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                className="h-11 w-full"
                disabled={anyLoading}
                onClick={handleGuestLogin}
                type="button"
                variant="secondary"
              >
                {isGuestLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang vào...
                  </>
                ) : (
                  <>
                    <UserRound className="size-4" />
                    Dùng tài khoản khách
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              href="/signup"
            >
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
