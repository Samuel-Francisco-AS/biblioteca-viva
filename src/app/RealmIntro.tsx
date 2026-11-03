export function RealmIntro({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <header className="realm-intro">
      <span aria-hidden="true">✧</span>
      <p>{title}</p>
      <small>{description}</small>
    </header>
  );
}
