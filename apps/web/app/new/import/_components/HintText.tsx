type HintTextProps = {
  children: React.ReactNode;
};

export function HintText({ children }: HintTextProps) {
  return <p className="mt-2 text-[11.5px] leading-relaxed text-brand-muted">{children}</p>;
}
