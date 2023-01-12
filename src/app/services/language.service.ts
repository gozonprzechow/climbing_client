import { Injectable } from '@angular/core';

export interface TextTranslator {
    cz: string;
    en: string;
}

export enum Country {
    kCz,
    kEu,
}

@Injectable()
export class LanguageService {
    readonly native_currency: string[] = ["CZK", "EUR"];

    getNativeLanguageText(textTranslator: TextTranslator): string {
        let languageIdentifier = this.getUsersLocale("en").slice(0, 2);
        let translateText;
        translateText = textTranslator.cz;
       /* if ("cs" === languageIdentifier) {
            translateText = textTranslator.cz;
        } else if ("en" === languageIdentifier) {
            translateText = textTranslator.en;
        } else {
            translateText = textTranslator.en;
        }*/
        return translateText;
    }

    getNativeCurrencyByLanguageText(): string {
        let languageIdentifier = this.getUsersLocale("en").slice(0, 2);
        let native_currency;
        if ("cs" === languageIdentifier) {
            native_currency = this.native_currency[Country.kCz];
        } else {
            native_currency = this.native_currency[Country.kEu];
        }
        return native_currency;
    }

    getAllCurrency() {
        return this.native_currency;
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