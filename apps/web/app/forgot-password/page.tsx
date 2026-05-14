"use client";

import { ArrowLeft, Info, Leaf, Loader2, Mail } from "lucide-react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
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
                Quên mật khẩu?
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Nhập email để nhận hướng dẫn đặt lại mật khẩu
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Đặt lại mật khẩu</CardTitle>
              <CardDescription>
                Chúng tôi sẽ gửi link đặt lại mật khẩu qua email
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!submitted ? (
                <form
                  className="space-y-4"
                  id="forgot-password-form"
                  onSubmit={handleSubmit}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email">
                      <Mail className="size-3.5 text-muted-foreground" />
                      Email đã đăng ký
                    </Label>
                    <Input
                      autoComplete="email"
                      disabled={isSubmitting}
                      id="forgot-email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>

                  <Button
                    className="h-11 w-full"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi yêu cầu"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-lg bg-accent/50 p-3 text-sm text-accent-foreground">
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <span>
                      Nếu email này đã đăng ký, bạn sẽ nhận được hướng dẫn
                      đặt lại mật khẩu trong vài phút tới. Hãy kiểm tra hộp
                      thư (bao gồm cả thư rác).
                    </span>
                  </div>

                  <Button
                    className="h-11 w-full"
                    onClick={() => setSubmitted(false)}
                    type="button"
                    variant="outline"
                  >
                    Thử lại với email khác
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              href="/login"
            >
              <ArrowLeft className="size-3.5" />
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
