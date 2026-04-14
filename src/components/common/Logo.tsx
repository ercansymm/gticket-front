"use client";

interface LogoProps {
   variant?: "white" | "dark";
}

/** AtaBilet logo — "Ata" kırmızı, "Bilet" beyaz veya koyu. Hard reload on click. */
const Logo = ({ variant = "white" }: LogoProps) => {
   const biletColor = variant === "white" ? "#FFFFFF" : "var(--ab-secondary)";

   const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      window.location.href = "/";
   };

   return (
      <a href="/" onClick={handleClick} className="bb-logo">
         <span style={{ color: "#DC2626" }}>Ata</span>
         <span style={{ color: biletColor }}>Bilet</span>
      </a>
   );
};

export default Logo;
