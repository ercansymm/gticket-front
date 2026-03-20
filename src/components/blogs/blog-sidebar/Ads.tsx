import Link from "next/link";
import Image from "next/image";

const Ads = () => {
   return (
      <div className="tg-blog-ads p-relative mb-40">
         <Image className="w-100" src="/assets/img/blog/sidebar/ads.jpg" alt="ads" width={300} height={400} />
         <div className="tg-blog-ads-btn">
            <Link href="/" className="tg-btn tg-btn-transparent tg-btn-switch-animation">
               <span>Uçuş Ara</span>
            </Link>
         </div>
      </div>
   )
}

export default Ads
