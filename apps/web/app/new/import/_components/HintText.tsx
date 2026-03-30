type HintTextProps = {
  children: React.ReactNode;
};

export function HintText({ children }: HintTextProps) {
  return <p className="mt-1.5 text-[11px] text-[#555]">{children}</p>;
}
