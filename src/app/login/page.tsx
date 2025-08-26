"use client";

import Link from "next/link";
import {
  Button,
  Center,
  Stack,
  Title,
  Paper,
  TextInput,
  PasswordInput,
  Divider,
  Anchor,
  Text,
} from "@mantine/core";
import { IconUser, IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/lib/notifications";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.actions.login);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!userId || !password) {
      showErrorNotification({
        title: "로그인 오류",
        message: "아이디와 비밀번호를 모두 입력해주세요.",
      });
      return;
    }

    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: { userId, password },
      });

      if (response && response.accessToken) {
        login(response.accessToken);
        showSuccessNotification({
          title: "로그인 성공",
          message: "로그인되었습니다. 메인 페이지로 이동합니다.",
        });
        router.push("/");
      } else {
        throw new Error("Access token not received");
      }
    } catch {
      showErrorNotification({
        title: "로그인 실패",
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }
  };

  const handleGoogleLogin = async () => {};

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack align="center" gap="lg">
          <Title order={1}>로그인</Title>
          <TextInput
            leftSection={<IconUser size={16} />}
            label="아이디"
            placeholder="아이디를 입력해주세요"
            value={userId}
            onChange={(event) => setUserId(event.currentTarget.value)}
            required
            w={300}
          />
          <PasswordInput
            leftSection={<IconLock size={16} />}
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            w={300}
          />
          <Button onClick={handleLogin} fullWidth>
            로그인
          </Button>
          <Divider label="또는" labelPosition="center" my="lg" />
          <Button variant="default" onClick={handleGoogleLogin} fullWidth>
            Google 계정으로 로그인
          </Button>
          <Text c="dimmed" size="sm" ta="center" mt="md">
            계정이 없으신가요?{" "}
            <Anchor component={Link} href="/signup">
              회원가입
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
