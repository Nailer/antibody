import { FileCode2 } from "lucide-react";
export function ScanIcon() {
  return <FileCode2 />;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Integration({
  name,
  icon,
  enabled,
  description,
  detail,
}: {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
  detail: string;
}) {
  return (
    <section className="panel integration">
      <div className="integration-icon">{icon}</div>
      <h2>{name}</h2>
      <p>{description}</p>
      <div className={enabled ? "connection connected" : "connection"}>
        <span />
        {detail}
      </div>
    </section>
  );
}
