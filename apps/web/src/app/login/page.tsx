"use client";

import { Dunes } from "@/components/ui/dunes";
import { Button } from "@analogia/ui-v4/button";
import { Icons } from "@analogia/ui-v4/icons";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { login } from "./actions";

enum SignInMethod {
  GITHUB = "github",
  GOOGLE = "google",
}

const LAST_SIGN_IN_METHOD_KEY = "lastSignInMethod";

export default function LoginPage() {
  const t = useTranslations();
  const [lastSignInMethod, setLastSignInMethod] = useState<SignInMethod | null>(
    null,
  );

  useEffect(() => {
    const lastSignInMethod = localStorage?.getItem(
      LAST_SIGN_IN_METHOD_KEY,
    ) as SignInMethod | null;
    if (lastSignInMethod) {
      setLastSignInMethod(lastSignInMethod);
    }
  }, []);

  const handleLogin = (method: SignInMethod) => {
    login(method);
    localStorage?.setItem(LAST_SIGN_IN_METHOD_KEY, method);
  };

  return (
    <div className="flex h-[calc(100vh-2.5rem)]">
      <div className="flex h-full w-full max-w-xl flex-col justify-between space-y-8 overflow-auto p-16">
        <div className="flex items-center space-x-2">
          <Icons.AnalogiaTextLogo viewBox="0 0 139 17" />
        </div>
        <div className="space-y-8">
          <div className="text-micro inline-block w-auto space-y-2 rounded-full border-[0.5px] border-blue-400 p-1 px-2 text-blue-400 uppercase">
            <p>{t("welcome.alpha")}</p>
          </div>
          <div className="space-y-4">
            <h1 className="text-title1 leading-tight">
              {lastSignInMethod ? t("welcome.titleReturn") : t("welcome.title")}
            </h1>
            <p className="text-foreground-analogia text-regular">
              {t("welcome.description")}
            </p>
          </div>
          <div className="flex flex-row space-x-2">
            <div className="flex w-full flex-col items-center">
              <Button
                variant="outline"
                className={`text-active text-small w-full ${lastSignInMethod === SignInMethod.GITHUB ? "text-small border-teal-300 bg-teal-100 text-teal-900 hover:border-teal-500/70 hover:bg-teal-200/50 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-100 dark:hover:border-teal-500 dark:hover:bg-teal-800" : "bg-background-analogia"}`}
                onClick={() => handleLogin(SignInMethod.GITHUB)}
              >
                <Icons.GitHubLogo className="mr-2 h-4 w-4" />{" "}
                {t("welcome.login.github")}
              </Button>
              {lastSignInMethod === SignInMethod.GITHUB && (
                <p className="text-small mt-1 text-teal-500">
                  {t("welcome.login.lastUsed")}
                </p>
              )}
            </div>
            <div className="flex w-full flex-col items-center">
              <Button
                variant="outline"
                className={`text-active text-small w-full ${lastSignInMethod === SignInMethod.GOOGLE ? "text-small border-teal-300 bg-teal-100 text-teal-900 hover:border-teal-500/70 hover:bg-teal-200/50 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-100 dark:hover:border-teal-500 dark:hover:bg-teal-800" : "bg-background-analogia"}`}
                onClick={() => handleLogin(SignInMethod.GOOGLE)}
              >
                <Icons.GoogleLogo
                  viewBox="0 0 24 24"
                  className="mr-2 h-4 w-4"
                />
                {t("welcome.login.google")}
              </Button>
              {lastSignInMethod === SignInMethod.GOOGLE && (
                <p className="text-small mt-1 text-teal-500">
                  {t("welcome.login.lastUsed")}
                </p>
              )}
            </div>
          </div>
          <p className="text-small text-foreground-analogia">
            {t("welcome.terms.agreement")}{" "}
            <button
              onClick={() =>
                window.open("https://analogia.ai/privacy-policy", "_blank")
              }
              className="text-gray-300 underline transition-colors duration-200 hover:text-gray-50"
            >
              {t("welcome.terms.privacy")}
            </button>{" "}
            {t("welcome.terms.and")}{" "}
            <button
              onClick={() =>
                window.open("https://analogia.ai/terms-of-service", "_blank")
              }
              className="text-gray-300 underline transition-colors duration-200 hover:text-gray-50"
            >
              {t("welcome.terms.tos")}
            </button>
          </p>
        </div>
        <div className="text-small flex flex-row space-x-1 text-gray-600">
          <p>{t("welcome.version", { version: "1.0.0" })}</p>
        </div>
      </div>
      <Dunes />
    </div>
  );
}
