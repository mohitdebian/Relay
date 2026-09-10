import Link from 'next/link';

export function DocsCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="docs-card">
      <div className="docs-card-title">{title}</div>
      <div className="docs-card-desc">{description}</div>
    </Link>
  );
}
