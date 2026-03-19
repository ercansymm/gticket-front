import Link from "next/link";

interface LogoProps {
   variant?: "white" | "dark";
}

/** AtaBilet logo — "Ata" kırmızı (#E30A17), "Bilet" beyaz veya koyu. */
const Logo = ({ variant = "white" }: LogoProps) => {
   const biletColor = variant === "white" ? "#FFFFFF" : "var(--ab-secondary)";

   return (
      <Link href="/" className="bb-logo">
         <span style={{ color: "var(--ab-primary)" }}>Ata</span>
         <span style={{ color: biletColor }}>Bilet</span>
      </Link>
   );
};

export default Logo;
