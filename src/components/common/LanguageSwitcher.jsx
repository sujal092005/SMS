import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();

  const currentLang = i18n.language || 'en';

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all">
        <Globe className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
        <select
          value={currentLang.startsWith('hi') ? 'hi' : currentLang.startsWith('mr') ? 'mr' : 'en'}
          onChange={(e) => changeLang(e.target.value)}
          className="bg-transparent border-none text-slate-800 text-xs font-bold focus:outline-none cursor-pointer pr-1"
          aria-label="Select Language"
        >
          <option value="en" className="text-slate-900 bg-white">English</option>
          <option value="hi" className="text-slate-900 bg-white">हिन्दी</option>
          <option value="mr" className="text-slate-900 bg-white">मराठी</option>
        </select>
      </div>
    </div>
  );
}
