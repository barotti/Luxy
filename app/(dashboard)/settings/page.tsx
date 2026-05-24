import { prisma } from "@/lib/db";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: { createdAt: "asc" },
  });

  return <SettingsClient paymentMethods={paymentMethods} />;
}
