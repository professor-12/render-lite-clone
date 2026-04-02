type SectionLabelProps = {
  children: React.ReactNode;
  htmlFor?: string;
};

export function SectionLabel({ children, htmlFor }: SectionLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[#ccc] mb-1.5">
      {children}
    </label>
  );
}
