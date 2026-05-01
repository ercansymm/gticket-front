"use client";

import { useState, useEffect } from "react";

const ScrollToTop = () => {
   const [visible, setVisible] = useState(false);
   const [hovered, setHovered] = useState(false);

   useEffect(() => {
      const onScroll = () => {
         setVisible(window.scrollY > 400);
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   if (!visible) return null;

   return (
      <button
         onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         aria-label="Yukarı çık"
         style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: hovered ? "#0a4363" : "#0a4363",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
         }}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
         >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
         </svg>
      </button>
   );
};

export default ScrollToTop;
