"use client";

import {
  Button,
  Center,
  Stack,
  TextInput,
  Title,
  Paper,
  PasswordInput,
  Divider,
  Anchor,
  Text,
} from "@mantine/core";
import {
  IconAt,
  IconLabel,
  IconLock,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/lib/notifications";

export default function SignupPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    userId: "",
    password: "",
    passwordConfirm: "",
    name: "",
    email: "",
    phone: "",
  });

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSignup = async () => {
    const { userId, password, passwordConfirm, name, email } = userInfo;
    console.log("handleSignup");

    if (!userId || !password || !passwordConfirm || !name || !email) {
      console.log("handleSignup 입력 오류 ");
      showErrorNotification({
        title: "입력 오류",
        message: "모든 필수 항목을 입력해주세요.",
      });
      return;
    }

    if (password !== passwordConfirm) {
      showErrorNotification({
        title: "입력 오류",
        message: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: userInfo,
      });

      showSuccessNotification({
        title: "회원가입 성공",
        message: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
      });
      router.push("/login");
    } catch (err: unknown) {
      showErrorNotification({
        title: "회원가입 실패",
        message: (err as Error).message,
      });
    }
  };

  const handleGoogleLogin = async () => {};

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p={30} radius="md">
        <Stack align="center" gap="md">
          <Title order={1}>회원가입</Title>
          <TextInput
            leftSection={<IconUser size={16} />}
            label="아이디"
            placeholder="아이디를 입력해주세요"
            name="userId"
            value={userInfo.userId}
            onChange={handleChangeInput}
            required
            w={300}
          />
          <PasswordInput
            leftSection={<IconLock size={16} />}
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            name="password"
            value={userInfo.password}
            onChange={handleChangeInput}
            required
            w={300}
          />
          <PasswordInput
            leftSection={<IconLock size={16} />}
            label="비밀번호 확인"
            placeholder="비밀번호를 입력해주세요"
            name="passwordConfirm"
            value={userInfo.passwordConfirm}
            onChange={handleChangeInput}
            required
            w={300}
          />
          <TextInput
            leftSection={<IconLabel size={16} />}
            label="이름"
            placeholder="이름을 입력해주세요"
            name="name"
            value={userInfo.name}
            onChange={handleChangeInput}
            required
            w={300}
          />
          <TextInput
            leftSection={<IconAt size={16} />}
            label="이메일"
            placeholder="이메일을 입력해주세요"
            name="email"
            value={userInfo.email}
            onChange={handleChangeInput}
            required
            w={300}
          />
          <TextInput
            leftSection={<IconPhone size={16} />}
            label="휴대폰번호"
            placeholder="휴대폰번호을 입력해주세요"
            name="phone"
            value={userInfo.phone}
            onChange={handleChangeInput}
            w={300}
          />
          <Button onClick={handleSignup} fullWidth>
            회원가입
          </Button>

          <Divider label="또는" labelPosition="center" my="md" />

          <Button variant="default" onClick={handleGoogleLogin} fullWidth>
            Google 계정으로 회원가입
          </Button>
          <Text c="dimmed" size="sm" ta="center" mt="md">
            계정이 이미 있으신가요?{" "}
            <Anchor component={Link} href="/login">
              로그인
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
