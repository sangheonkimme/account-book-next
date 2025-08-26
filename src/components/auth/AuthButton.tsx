'use client';

import { useAuthStore } from '@/store/auth';
import { Button, Group, Loader } from '@mantine/core';
import Link from 'next/link';

export default function AuthButton() {
  const { isLoggedIn, isAuthInitialized } = useAuthStore();
  const { logout } = useAuthStore((s) => s.actions);

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthInitialized) {
    return <Loader size="sm" />;
  }

  return (
    <Group>
      {isLoggedIn ? (
        <Button onClick={handleLogout}>로그아웃</Button>
      ) : (
        <>
          <Link href="/login">
            <Button variant="default">로그인</Button>
          </Link>
          <Link href="/signup">
            <Button variant="default">회원가입</Button>
          </Link>
        </>
      )}
    </Group>
  );
}