"use client";

import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Lock,
  Plus,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { AppHeader } from "@/components/foundation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthRequiredHref, useAuthHint } from "@/lib/auth-session";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  accent: string;
};

const features: Feature[] = [
  {
    title: "Ghi nhớ ngày mở nắp",
    description:
      "Lưu ngày mở nắp, hạn dùng trên bao bì và ghi chú cần nhớ cho từng món trong một màn hình.",
    icon: CalendarDays,
    accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    title: "Ưu tiên món cần dùng sớm",
    description:
      "Sắp xếp danh sách theo trạng thái khuyến nghị để cả nhà nhìn nhanh món nên xem trước.",
    icon: ClipboardCheck,
    accent: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  {
    title: "Nhắc nhở theo vị trí bảo quản",
    description:
      "Theo dõi riêng ngăn mát, ngăn đông và nhiệt độ phòng để gợi ý đúng ngữ cảnh hơn.",
    icon: BellRing,
    accent: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },
];

const steps = [
  {
    verb: "Quét",
    title: "Quét hoặc chọn sản phẩm",
    description: "Bắt đầu từ barcode hoặc nhập tay tên sản phẩm trong vài giây.",
    icon: ScanLine,
  },
  {
    verb: "Ghi lại",
    title: "Nhập ngày mở nắp",
    description: "Thêm ngày mở nắp, vị trí bảo quản và hạn dùng nếu có trên bao bì.",
    icon: CalendarDays,
  },
  {
    verb: "Theo dõi",
    title: "Xem trạng thái khuyến nghị",
    description: "Theo dõi nhãn trạng thái bằng chữ rõ ràng, không chỉ dựa vào màu.",
    icon: ClipboardCheck,
  },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const hasAuth = useAuthHint();
  const dashboardHref = hasAuth
    ? "/dashboard"
    : getAuthRequiredHref("/dashboard");
  const addFoodHref = hasAuth
    ? "/foods/new"
    : getAuthRequiredHref("/foods/new");
  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AppHeader />

      <main>
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HERO                                                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b">
          {/* Warm radial glow behind content */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 30% 50%, oklch(0.85 0.08 158 / 0.4), transparent), radial-gradient(ellipse 50% 60% at 80% 30%, oklch(0.88 0.06 90 / 0.3), transparent)",
            }}
          />

          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            {/* Left: Text content */}
            <motion.div {...motionProps} className="max-w-xl">
              <h1 className="pb-1 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                <span className="font-heading italic">
                  Biết món nào nên dùng trước
                </span>{" "}
                <span className="font-sans text-foreground/70">
                  trong tủ lạnh của bạn
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
                Bếp An Tâm giúp theo dõi thực phẩm, giảm lãng phí và tiết kiệm tiền.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 justify-center rounded-full px-7 text-base font-semibold shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
                >
                  <Link href={dashboardHref}>
                    Xem tủ lạnh số
                    <ArrowRight aria-hidden="true" className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-12 justify-center rounded-full px-7 text-base font-medium active:scale-[0.98]"
                  variant="outline"
                >
                  <Link href={addFoodHref}>
                    <Plus aria-hidden="true" className="size-4" />
                    Thêm thực phẩm
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right: Fridge illustration with animated floating badges */}
            <motion.div
              {...motionProps}
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 0.5,
                      delay: 0.08,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }
              }
              className="relative"
            >
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Fridge image */}
                <div className="relative overflow-hidden rounded-3xl border bg-card shadow-[0_20px_60px_rgba(15,75,54,0.10)]">
                  <Image
                    alt="Tủ lạnh thông minh An Tâm Kitchen"
                    className="w-full object-cover"
                    height={480}
                    priority
                    src="/hero-fridge.png"
                    width={640}
                  />

                  {/* Floating status badges with gentle bob animation */}
                  <motion.div
                    animate={reduceMotion ? {} : { y: [0, -4, 0] }}
                    transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                  >
                    <span className="size-2 rounded-full bg-white" />
                    Tươi mới
                  </motion.div>

                  <motion.div
                    animate={reduceMotion ? {} : { y: [0, -5, 0] }}
                    transition={reduceMotion ? undefined : { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                  >
                    <span className="size-2 rounded-full bg-white" />
                    Nên dùng sớm
                  </motion.div>

                  <motion.div
                    animate={reduceMotion ? {} : { y: [0, -3, 0] }}
                    transition={reduceMotion ? undefined : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                    className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
                  >
                    <span className="size-2 rounded-full bg-white" />
                    Cần mua/Hết hạn
                  </motion.div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm dark:bg-card/90">
                    2 món
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* DIGITAL FRIDGE DASHBOARD                                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {hasAuth ? <DashboardRedirectPrompt /> : <LockedDigitalFridgePrompt />}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FEATURES - Asymmetric zig-zag (§9.C: NO 3-col equal)      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="scroll-mt-20 bg-card py-16 sm:py-20" id="features">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...motionProps} className="max-w-2xl">
              <h2 className="font-heading text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                Một màn hình đủ rõ cho việc quản lý hằng ngày
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Trang demo tập trung vào thao tác gia đình thật sự cần: nhớ món đã mở, xem món cần ưu tiên và nhận nhắc nhở theo nơi bảo quản.
              </p>
            </motion.div>

            {/* Zig-zag feature rows */}
            <div className="mt-12 space-y-10 lg:space-y-16">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const isReversed = index % 2 !== 0;

                return (
                  <motion.div
                    {...motionProps}
                    key={feature.title}
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 0.5,
                            delay: index * 0.08,
                            ease: [0.22, 1, 0.36, 1] as const,
                          }
                    }
                    className={cn(
                      "grid items-center gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-12",
                      isReversed && "lg:grid-cols-[1.2fr_1fr]"
                    )}
                  >
                    {/* Text side */}
                    <div className={cn(isReversed && "lg:order-2")}>
                      <div
                        className={cn(
                          "mb-4 flex size-14 items-center justify-center rounded-2xl",
                          feature.accent
                        )}
                      >
                        <Icon aria-hidden={true} className="size-6" />
                      </div>
                      <h3 className="font-heading text-2xl font-semibold leading-tight sm:text-3xl">
                        {feature.title}
                      </h3>
                      <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>

                    {/* Visual side - accent card with subtle texture */}
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 sm:p-12",
                        index === 0 && "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10",
                        index === 1 && "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10",
                        index === 2 && "from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/10",
                        isReversed && "lg:order-1"
                      )}
                    >
                      <div className="flex aspect-[4/3] items-center justify-center">
                        <Icon
                          aria-hidden={true}
                          className={cn(
                            "size-20 opacity-20",
                            index === 0 && "text-emerald-600 dark:text-emerald-400",
                            index === 1 && "text-amber-600 dark:text-amber-400",
                            index === 2 && "text-sky-600 dark:text-sky-400",
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS - Verb-noun labels, no numbered steps (§9.F)  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="scroll-mt-20 bg-background py-16 sm:py-20" id="add-food">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...motionProps} className="max-w-2xl">
              <h2 className="font-heading text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                Từ món vừa mở nắp đến trạng thái khuyến nghị
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Luồng demo ngắn, dễ trình bày với giám khảo và đủ gần với cách một gia đình dùng sản phẩm.
              </p>
            </motion.div>

            {/* Verb-noun step cards */}
            <div className="relative mt-12">
              {/* Connecting line (desktop) */}
              <div className="absolute left-0 right-0 top-10 hidden h-px bg-border lg:block" aria-hidden="true" />

              <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      {...motionProps}
                      key={step.title}
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 0.4,
                              delay: index * 0.1,
                              ease: [0.22, 1, 0.36, 1] as const,
                            }
                      }
                      className="group relative rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                    >
                      {/* Verb pill */}
                      <div className="mb-4 flex items-center gap-3">
                        <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                          <Icon aria-hidden={true} className="size-5" />
                        </span>
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                          {step.verb}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CTA FOOTER                                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-t py-16 sm:py-20">
          {/* Warm gradient background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-25"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.90 0.06 158 / 0.3), transparent)",
            }}
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Giữ căn bếp dễ theo dõi hơn, từng món một.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Bếp An Tâm không thay người dùng tự đánh giá thực phẩm, nhưng giúp
              thông tin về ngày mở nắp, hạn dùng và vị trí bảo quản rõ ràng hơn.
            </p>
            <div className="mt-8">
              <Button asChild className="h-13 rounded-full px-8 text-base font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.98]">
                <Link href={dashboardHref}>
                  Bắt đầu sử dụng
                  <ArrowRight aria-hidden="true" className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LockedDigitalFridgePrompt() {
  const loginHref = getAuthRequiredHref("/dashboard");

  return (
    <section className="scroll-mt-20 bg-card py-12 sm:py-16" id="digital-fridge">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border bg-background shadow-sm">
          <CardHeader className="items-center px-5 pt-8 text-center sm:px-8 sm:pt-10">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Lock aria-hidden={true} className="size-5" />
            </span>
            <CardTitle className="font-heading text-2xl font-semibold leading-tight tracking-normal sm:text-3xl">
              Đăng nhập để xem tủ lạnh số của bạn
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Theo dõi thực phẩm đã mở nắp, hạn dùng và món nên dùng trước sau
              khi đăng nhập.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-8 sm:px-8 sm:pb-10">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-full px-5 active:scale-[0.98]">
                <Link href={loginHref}>Dùng thử tài khoản khách</Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-full px-5 active:scale-[0.98]"
                variant="outline"
              >
                <Link href="/signup">Đăng ký miễn phí</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function DashboardRedirectPrompt() {
  return (
    <section className="scroll-mt-20 bg-card py-6 sm:py-8" id="digital-fridge">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-primary/5 px-6 py-5 sm:flex-row dark:bg-primary/10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutDashboard aria-hidden={true} className="size-4" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Bảng điều khiển đã sẵn sàng</p>
              <p className="text-sm text-muted-foreground">Xem thực phẩm, theo dõi hạn sử dụng và ước tính lãng phí.</p>
            </div>
          </div>
          <Button asChild className="h-10 shrink-0 rounded-full px-5 shadow-sm active:scale-[0.98]">
            <Link href="/dashboard">
              Vào bảng điều khiển
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
