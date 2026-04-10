type ComingSoonProps = {
  text?: string;
};

export function ComingSoon({ text = "Coming Soon" }: ComingSoonProps) {
  return <p className="px-1 text-sm text-foreground/70">{text}</p>;
}