"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenIcon, MenuIcon, SearchIcon, LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/logout/actions";

export type HeaderUser = {
  username: string;
  avatarUrl: string | null;
} | null;

export function Header({ user }: { user: HeaderUser }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <BookOpenIcon className="h-5 w-5 text-primary" />
          <span className="font-mono text-lg font-bold tracking-widest">HONDANA</span>
        </Link>

        {/* 検索バー（デスクトップ） */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="書籍を検索..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <AuthenticatedNav user={user} />
          ) : (
            <UnauthenticatedNav />
          )}
        </nav>

        {/* モバイルメニュー */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">メニューを開く</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>メニュー</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 pt-4">
                {/* 検索バー（モバイル） */}
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="書籍を検索..."
                    className="pl-9"
                  />
                </div>

                {/* ナビゲーション（モバイル） */}
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href="/mypage" onClick={() => setMobileOpen(false)}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        マイページ
                      </Link>
                    </Button>
                    <form action={logout}>
                      <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                      >
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        ログアウト
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        ログイン
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/signup" onClick={() => setMobileOpen(false)}>
                        新規登録
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function UnauthenticatedNav() {
  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">ログイン</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/signup">新規登録</Link>
      </Button>
    </>
  );
}

function AuthenticatedNav({ user }: { user: NonNullable<HeaderUser> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl ?? ""} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/mypage">
            <UserIcon className="mr-2 h-4 w-4" />
            マイページ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button type="submit" className="flex w-full items-center text-destructive">
              <LogOutIcon className="mr-2 h-4 w-4" />
              ログアウト
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
