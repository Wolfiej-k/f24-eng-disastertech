interface HeaderProps {
  title: string;
  subtitle?: string;
  button?: JSX.Element;
}

export default function Header({ title, subtitle, button }: HeaderProps) {
  return (
    <div className="flex items-center justify-between bg-primary px-6 py-4">
      <header className="text-white">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-lg">{subtitle}</p>}
      </header>
      {button && <div className="flex items-center">{button}</div>}
    </div>
  );
}
