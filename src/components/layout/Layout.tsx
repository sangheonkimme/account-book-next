"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import AuthButton from "@/components/auth/AuthButton";
import {
  AppShell,
  Group,
  Container,
  Title,
  MantineProvider,
} from "@mantine/core";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { useAuthStore } from "@/store/auth";
import GoogleAnalytics from "../common/GoogleAnalytics";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { initializeAuth } = useAuthStore((s) => s.actions);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <MantineProvider>
      <Notifications />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}

      <AppShell header={{ height: 60 }}>
        {/* Navbar */}
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Title order={3}>나의 가계부</Title>
            </Link>
            <AuthButton />
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          {/* Children */}
          <Container fluid>{children}</Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
};

export default Layout;
