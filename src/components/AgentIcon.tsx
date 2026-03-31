import {
  Scale,
  ScrollText,
  Landmark,
  HeartHandshake,
  Wrench,
  type LucideProps,
} from "lucide-react";

const iconMap: Record<string, React.FC<LucideProps>> = {
  scale: Scale,
  "scroll-text": ScrollText,
  landmark: Landmark,
  "heart-handshake": HeartHandshake,
  wrench: Wrench,
};

export function AgentIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon {...props} />;
}
