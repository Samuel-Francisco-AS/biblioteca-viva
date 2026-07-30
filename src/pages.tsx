interface PlaceholderPageProps {
  description: string;
  title: string;
}

function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <section className="placeholder" aria-labelledby="placeholder-title">
      <p className="placeholder__status">Funcionalidade planejada</p>
      <h2 id="placeholder-title">{title}</h2>
      <p>{description}</p>
      <p className="placeholder__notice">
        Esta área ainda não possui funcionalidades implementadas.
      </p>
    </section>
  );
}

export function LibraryPage() {
  return (
    <PlaceholderPage
      description="Aqui ficará a representação visual viva da biblioteca, conectada às ações registradas no aplicativo."
      title="Biblioteca"
    />
  );
}

export function ArchivePage() {
  return (
    <PlaceholderPage
      description="Aqui serão reunidas as notas e citações salvas durante as leituras."
      title="Arquivo"
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      description="Aqui ficarão as preferências da experiência e as futuras ferramentas de dados."
      title="Configurações"
    />
  );
}
