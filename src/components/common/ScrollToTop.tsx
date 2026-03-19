import { useState, useEffect } from "react";
import UseSticky from "../../hooks/UseSticky";

const ScrollToTop = () => {
   const { sticky }: { sticky: boolean } = UseSticky();
   const [showScroll, setShowScroll] = useState(false);

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   useEffect(() => {
      const checkScrollTop = () => {
         const currentScroll = window.pageYOffset > 400;
         setShowScroll(prev => (prev !== currentScroll ? currentScroll : prev));
      };

      window.addEventListener("scroll", checkScrollTop);
      return () => window.removeEventListener("scroll", checkScrollTop);
   }, []);

   return (
      <button
         onClick={scrollTop}
         className={`scroll__top scroll-to-target ${sticky && showScroll ? "open" : ""}`}
         data-target="html"
      >
         <i className="fa-sharp fa-regular fa-arrow-up"></i>
      </button>
   );
};

export default ScrollToTop;
