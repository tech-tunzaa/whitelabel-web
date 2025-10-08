import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "./../public/logo.svg";

export function AuthSiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={logo} alt="Marketplace" />
          </Link>
        </div>
      </div>
    </header>
  );
}
