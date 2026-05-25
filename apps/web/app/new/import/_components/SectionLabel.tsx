type SectionLabelProps = {
  children: React.ReactNode;
  htmlFor?: string;
};

export function SectionLabel({ children, htmlFor }: SectionLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-brand-muted-soft"
    >
      {children}
    </label>
  );
}
