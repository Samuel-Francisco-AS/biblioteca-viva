import { useCallback, useMemo } from "react";
import type { BookEntry, Quote } from "../../domain";
import type { ImageFilesPort } from "../../application/imageFiles";
import type { LocalPoster } from "../../application/media";
import { BVShareComposer } from "../share-composer/BVShareComposer";
import type { ShareComposition } from "../share-composer/composition";
import { createBookImage } from "./bookImage";
export function BookImageShare({
  book,
  quotes,
  files,
  poster,
}: {
  readonly book: BookEntry;
  readonly quotes: readonly Quote[];
  readonly files?: ImageFilesPort;
  readonly poster?: LocalPoster;
}) {
  const modes = useMemo(
    () => [
      { id: "summary", label: "Resumo da leitura" },
      ...quotes.map((quote, index) => ({
        id: quote.id,
        label: `Citação ${index + 1}${quote.location?.type === "book" ? ` · p. ${quote.location.page}` : ""} · ${quote.content.slice(0, 55)}`,
        text: quote.content,
      })),
    ],
    [quotes],
  );
  const renderImage = useCallback(
    (options: ShareComposition) => {
      const quote = quotes.find((item) => item.id === options.mode);
      return createBookImage(
        book,
        quote ? { ...quote, content: options.text } : undefined,
        options,
      );
    },
    [book, quotes],
  );
  return (
    <BVShareComposer
      contentKey={JSON.stringify(book)}
      title={book.title}
      modes={modes}
      poster={poster}
      files={files}
      renderImage={renderImage}
      book
      labels={{
        open: "Criar imagem da leitura",
        close: "Fechar prévia",
        share: "Compartilhar imagem",
        save: "Salvar imagem PNG",
        message: "Mensagem personalizada",
      }}
    />
  );
}
