import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { Container, PageHeader } from "@/components/layout";
import { Stagger, StaggerItem } from "@/components/motion";
import { DeleteAccountForm, PasswordForm, ProfileForm } from "./SettingsForms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <Container className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your profile, password and account." />
      <Stagger inView={false} interval={0.12} className="space-y-8">
        <StaggerItem kind="cascade"><ProfileForm user={{ name: user.name, email: user.email, bio: user.bio, avatar: user.avatar }} /></StaggerItem>
        <StaggerItem kind="cascade"><PasswordForm /></StaggerItem>
        <StaggerItem kind="cascade"><DeleteAccountForm /></StaggerItem>
      </Stagger>
    </Container>
  );
}
