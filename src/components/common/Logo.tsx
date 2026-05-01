"use client";
import Image from "next/image";

interface LogoProps {
   variant?: "white" | "dark";
}

/** AtaBilet logo — SVG dosyasından render edilir. "Ata" kırmızı, "Bilet" beyaz veya koyu. */
const Logo = ({ variant = "white" }: LogoProps) => {
   const src = variant === "white" ? "/images/logo-white.svg" : "/images/logo-dark.svg";

   const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      window.location.href = "/";
   };

   return (
      <a href="/" onClick={handleClick} className="bb-logo">
         <Image
            src={src}
            alt="AtaBilet"
            width={168}
            height={44}
            priority
            style={{ display: "block" }}
         />
      </a>
   );
};

export default Logo;
