import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const INDIAN_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", flag: "🇮🇳" },
];

interface LanguageContextType {
  currentLang: string;
  selectedLanguage: Language;
  setLanguage: (code: string) => void;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<string>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bizora-lang");
      if (saved && INDIAN_LANGUAGES.some((l) => l.code === saved)) {
        setCurrentLang(saved);
        applyGoogleTranslate(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const applyGoogleTranslate = (langCode: string) => {
    const val = langCode === "en" ? "" : `/en/${langCode}`;
    document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${val}; path=/;`;

    // Trigger google translate select element if initialized
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
    } else {
      // Dynamically inject Google Translate script if not present
      if (!document.getElementById("google-translate-script") && langCode !== "en") {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);

        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,mr,gu,ta,te,kn,ml,bn,pa,or,as",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        };
      }
    }
  };

  const setLanguage = (code: string) => {
    setCurrentLang(code);
    try {
      localStorage.setItem("bizora-lang", code);
    } catch (e) {}
    applyGoogleTranslate(code);
  };

  const selectedLanguage =
    INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        selectedLanguage,
        setLanguage,
        languages: INDIAN_LANGUAGES,
      }}
    >
      {children}
      <div id="google_translate_element" style={{ display: "none" }} />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback if provider not in tree
    return {
      currentLang: "en",
      selectedLanguage: INDIAN_LANGUAGES[0],
      setLanguage: (code: string) => {
        try { localStorage.setItem("bizora-lang", code); } catch(e) {}
        const val = code === "en" ? "" : `/en/${code}`;
        document.cookie = `googtrans=${val}; path=/;`;
        window.location.reload();
      },
      languages: INDIAN_LANGUAGES,
    };
  }
  return ctx;
}
