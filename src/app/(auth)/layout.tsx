import { Reveal } from "@/components/motion";
import { AuthShowcase } from "./AuthShowcase";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
      <div className="hidden lg:block">
        <AuthShowcase />
      </div>
      <Reveal kind="fade-right" delay={0.15} className="mx-auto w-full max-w-md">
        {children}
      </Reveal>
    </div>
  );
}
