import { useRouter } from "expo-router";
import { useEffect } from "react";

import { OnboardingBackground } from "@/components/onboarding/OnboardingBackground";

const splashBackground = require("../../../assets/images/Imág. INICIO.jpg");

export default function SplashRoute() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => router.replace("/onboarding/video"), 2000);
    return () => clearTimeout(timeout);
  }, [router]);

  return <OnboardingBackground source={splashBackground} />;
}
