import Link from "next/link";

export default function GatewayCard({
  title,
  description,
  href
}: any) {
  return (
    <Link href={href}>
      <div
        style={{
          padding: 20,
          border: "1px solid #333",
          borderRadius: 10,
          background: "#111",
          cursor: "pointer"
        }}
      >
        <h3>{title}</h3>
        <p style={{ opacity: 0.7 }}>{description}</p>
        <span style={{ opacity: 0.5 }}>Enter →</span>
      </div>
    </Link>
  );
}