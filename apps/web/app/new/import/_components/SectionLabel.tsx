type SectionLabelProps = {
  children: React.ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
  return <label className="block text-[13px] font-medium text-[#ccc] mb-1.5">{children}</label>;
}
