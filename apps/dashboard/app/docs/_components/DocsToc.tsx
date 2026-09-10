export function DocsToc({ links }: { links: { label: string; href: string }[] }) {
  return (
    <aside className="docs-toc">
      <div className="toc-title">ON THIS PAGE</div>
      <ul className="toc-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
