interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <>
      <header className="relative flex items-center justify-between bg-primary px-6 py-4 text-white">
        <div>
          <h1 className="mb-1 text-2xl font-bold">{title}</h1>
          <p className="text-lg">{subtitle}</p>
        </div>
      </header>
    </>
  );
}
