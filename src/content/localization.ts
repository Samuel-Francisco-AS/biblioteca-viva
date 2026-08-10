import type { DialogueLocalizer, LocalizedText } from "../application";
import type { ContentCatalog } from "./schemas";

const LAST_RESORT_TEXT = "Conteúdo indisponível.";

export class ContentLocalizer implements DialogueLocalizer {
  constructor(private readonly catalog: ContentCatalog) {}

  translate(key: string, locale = this.catalog.defaultLocale): LocalizedText {
    const requested = this.catalog.locales.find(
      (candidate) => candidate.locale === locale,
    );
    const fallback = this.catalog.locales.find(
      (candidate) => candidate.locale === this.catalog.defaultLocale,
    );
    const requestedText = requested?.messages[key];
    if (requestedText)
      return Object.freeze({ locale: requested.locale, text: requestedText });
    const fallbackText = fallback?.messages[key];
    if (fallbackText)
      return Object.freeze({
        locale: this.catalog.defaultLocale,
        text: fallbackText,
      });
    return Object.freeze({
      locale: this.catalog.defaultLocale,
      text: fallback?.messages["interface.content.missing"] ?? LAST_RESORT_TEXT,
    });
  }
}
