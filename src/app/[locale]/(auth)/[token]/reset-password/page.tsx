"use client";

import { use } from "react";
import { ResetPassword } from "@/components/pages";

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = use(params);
  return <ResetPassword token={token} />;
}
