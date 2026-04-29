import Link from "next/link";

const Cta = () => {
   return (
      <div className="ab-cta">
         <div className="container">
            <div className="ab-cta__inner">
               <div>
                  <h2 className="ab-cta__title">Hemen Bilet Alın</h2>
                  <p className="ab-cta__desc">Popüler rotalar, uygun fiyatlar, anında bilet.</p>
               </div>
               <Link href="/" className="ab-cta__btn">
                  Uçuş Ara
               </Link>
            </div>
         </div>
      </div>
   );
};

export default Cta;
