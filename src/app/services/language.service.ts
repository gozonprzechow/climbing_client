import { Injectable } from '@angular/core';

export interface TextTranslator {
    cz: string;
    en: string;
  }

@Injectable()
export class LanguageService {
    getNativeLanguageText(textTranslator: TextTranslator): string{
        let languageIdentifier = this.getUsersLocale("en").slice(0,2);
        let translateText;
        if ("cs" === languageIdentifier) {
            translateText = textTranslator.cz;
        } else if ("en" === languageIdentifier) {
            translateText = textTranslator.en;
        } else {
            translateText = textTranslator.en;
        }
        return translateText;
    }
    getUsersLocale(defaultValue: string): string {
        if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
            return defaultValue;
        }
        const wn = window.navigator as any;
        let lang = wn.languages ? wn.languages[0] : defaultValue;
        lang = lang || wn.language || wn.browserLanguage || wn.userLanguage;
        return lang;
    }
}