"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Globe } from "lucide-react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";

import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle/theme-toggle";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage, setCurrentLanguage } from "@/src/i18n";
import packageJson from "../package.json";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const languages = {
    en: { name: "English", flag: "🇬🇧" },
    sw: { name: "Swahili", flag: "🇹🇿" },
    fr: { name: "Français", flag: "🇫🇷" },
  } as const;

  const handleLanguageChange = (code: keyof typeof languages) => {
    // Update localStorage and i18n
    setCurrentLanguage(code);
    
    // Force re-render to update translations
    i18n.changeLanguage(code);
  };

  // Get current language from i18n (always available on client)
  const currentLanguage = i18n.language as keyof typeof languages;
  const currentFlag = languages[currentLanguage]?.flag || languages['en'].flag;
  const currentName = languages[currentLanguage]?.name || languages['en'].name;

  // Memoize the language switcher content to prevent hydration issues
  const languageSwitcherContent = {
    flag: currentFlag,
    name: currentName,
    languages: Object.entries(languages).map(([code, { name, flag }]) => ({
      code: code as keyof typeof languages,
      name,
      flag
    }))
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-medium">{t('common:app_name')}</h1>
          <span className="text-xs text-muted-foreground">v{packageJson.version}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Globe className="h-4 w-4 mr-2" />
                <span>{languageSwitcherContent.flag}</span>
                <span className="ml-2 hidden md:inline-flex">{languageSwitcherContent.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languageSwitcherContent.languages.map(({ code, name, flag }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                >
                  <div className="flex items-center gap-2">
                    <span>{flag}</span>
                    <span>{name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
