"use client";

import {
  ArrowRight,
  BellRing,
  CalendarDays,
  ClipboardCheck,
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
import { DigitalFridgeDashboard } from "./digital-fridge-dashboard";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const features: Feature[] = [
  {
    title: "Ghi nhớ ngày mở nắp",
    description:
      "Lưu ngày mở nắp, hạn dùng trên bao bì và ghi chú cần nhớ cho từng món trong một màn hình.",
    icon: CalendarDays,
  },
  {
    title: "Ưu tiên món cần dùng sớm",
    description:
      "Sắp xếp danh sách theo trạng thái khuyến nghị để cả nhà nhìn nhanh món nên xem trước.",
    icon: ClipboardCheck,
  },
  {
    title: "Nhắc nhở theo vị trí bảo quản",
    description:
      "Theo dõi riêng ngăn mát, ngăn đông và nhiệt độ phòng để gợi ý đúng ngữ cảnh hơn.",
    icon: BellRing,
  },
];

const steps = [
  {
    title: "Quét hoặc chọn sản phẩm",
    description: "Bắt đầu từ barcode hoặc nhập tay tên sản phẩm trong vài giây.",
    icon: ScanLine,
  },
  {
    title: "Nhập ngày mở nắp",
    description: "Thêm ngày mở nắp, vị trí bảo quản và hạn dùng nếu có trên bao bì.",
    icon: CalendarDays,
  },
  {
    title: "Xem trạng thái khuyến nghị",
    description: "Theo dõi nhãn trạng thái bằng chữ rõ ràng, không chỉ dựa vào màu.",
    icon: ClipboardCheck,
  },
];

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const hasAuth = useAuthHint();
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
        {/* HERO SECTION — Clean 2-column layout matching mockup      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="overflow-hidden border-b bg-[linear-gradient(180deg,var(--background)_0%,var(--card)_100%)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-20">
            {/* Left: Text content */}
            <motion.div {...motionProps} className="max-w-xl">
              <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
                <span className="italic">Biết món nào nên{" "}</span>
                <span className="italic">dùng trước</span>{" "}
                <span className="text-foreground/80">trong tủ lạnh của bạn</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Bếp An Tâm giúp theo dõi thực phẩm, giảm lãng phí và tiết kiệm tiền.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 justify-center rounded-full px-7 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                >
                  <a href="#digital-fridge">
                    Xem tủ lạnh số
                    <ArrowRight aria-hidden="true" className="ml-1 size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  className="h-12 justify-center rounded-full px-7 text-base font-medium"
                  variant="outline"
                >
                  <Link href={addFoodHref}>
                    <Plus aria-hidden="true" className="size-4" />
                    Thêm thực phẩm
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Right: Fridge illustration with floating badges */}
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
                <div className="relative overflow-hidden rounded-3xl border bg-card shadow-[0_20px_60px_rgba(15,75,54,0.12)]">
                  <Image
                    alt="Tủ lạnh thông minh An Tâm Kitchen"
                    className="w-full object-cover"
                    height={480}
                    priority
                    src="/hero-fridge.png"
                    width={640}
                  />

                  {/* Floating status badges */}
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                    <span className="size-2 rounded-full bg-white" />
                    Tươi mới
                  </div>

                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                    <span className="size-2 rounded-full bg-white" />
                    Nên dùng sớm
                  </div>

                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                    <span className="size-2 rounded-full bg-white" />
                    Cần mua/Hết hạn
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm">
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
        {hasAuth ? <DigitalFridgeDashboard /> : <LockedDigitalFridgePrompt />}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="scroll-mt-20 bg-card py-12 sm:py-16" id="features">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow="Tính năng chính"
              title="Một màn hình đủ rõ cho việc quản lý hằng ngày"
              description="Trang demo tập trung vào thao tác gia đình thật sự cần: nhớ món đã mở, xem món cần ưu tiên và nhận nhắc nhở theo nơi bảo quản."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  {...motionProps}
                  key={feature.title}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          duration: 0.4,
                          delay: index * 0.06,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }
                  }
                >
                  <FeatureCard feature={feature} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS — 3 Steps                                     */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="scroll-mt-20 bg-background py-12 sm:py-16" id="add-food">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              eyebrow="3 bước sử dụng"
              title="Từ món vừa mở nắp đến trạng thái khuyến nghị"
              description="Luồng demo ngắn, dễ trình bày với giám khảo và đủ gần với cách một gia đình dùng sản phẩm."
            />

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
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
                            delay: index * 0.06,
                            ease: [0.22, 1, 0.36, 1] as const,
                          }
                    }
                  >
                    <article className="h-full rounded-3xl border bg-card p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                          <Icon aria-hidden={true} className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-primary">
                            Bước {index + 1}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CTA FOOTER                                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="border-t bg-card py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Bếp An Tâm
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Giữ căn bếp dễ theo dõi hơn, từng món một.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Bếp An Tâm không thay người dùng tự đánh giá thực phẩm, nhưng giúp
              thông tin về ngày mở nắp, hạn dùng và vị trí bảo quản rõ ràng hơn.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full px-7 text-base">
                <a href="#digital-fridge">Xem tủ lạnh số</a>
              </Button>
              <Button
                asChild
                className="h-12 rounded-full px-7 text-base"
                variant="outline"
              >
                <Link href={addFoodHref}>Thêm thực phẩm</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LockedDigitalFridgePrompt() {
  const loginHref = getAuthRequiredHref("/#digital-fridge");

  return (
    <section className="scroll-mt-20 bg-card py-12 sm:py-16" id="digital-fridge">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border bg-background shadow-sm">
          <CardHeader className="items-center px-5 pt-8 text-center sm:px-8 sm:pt-10">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Lock aria-hidden={true} className="size-5" />
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Tủ lạnh số
            </p>
            <CardTitle className="mt-2 text-2xl font-semibold leading-tight tracking-normal sm:text-3xl">
              Đăng nhập để xem tủ lạnh số của bạn
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Theo dõi thực phẩm đã mở nắp, hạn dùng và món nên dùng trước sau
              khi đăng nhập.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-8 sm:px-8 sm:pb-10">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-full px-5">
                <Link href={loginHref}>Đăng nhập</Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-full px-5"
                variant="outline"
              >
                <Link href="/signup">Đăng ký</Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-full px-5"
                variant="secondary"
              >
                <Link href={loginHref}>Dùng thử tài khoản khách</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <Card className="h-full rounded-3xl border bg-background shadow-sm transition hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icon aria-hidden={true} className="size-5" />
        </div>
        <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
        <CardDescription className="text-base leading-7">
          {feature.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}
