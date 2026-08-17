import React from "react";
import { Group, Text } from "@mantine/core";
import classes from "./auth.module.css";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      <Group justify="center" gap={8} className={classes.logo}>
        <img
          src="/icons/aerith-logo.svg"
          alt="Aerith"
          width={22}
          height={22}
        />
        <Text size="28px" fw={700} style={{ userSelect: "none" }}>
          Aerith
        </Text>
      </Group>
      <main>{children}</main>
    </>
  );
}
