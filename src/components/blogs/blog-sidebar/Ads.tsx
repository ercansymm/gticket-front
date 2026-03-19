import Link from "next/link";
import Button from "../../common/Button";
import Image from "next/image";

const Ads = () => {
   return (
      <div className="tg-blog-ads p-relative mb-40">
         <Image className="w-100" src="/assets/img/blog/sidebar/ads.jpg" alt="ads" width={300} height={400} />
         <div className="tg-blog-ads-btn">
            <Link href="/tour-details" className="tg-btn tg-btn-transparent tg-btn-switch-animation">
               <Button text="Book Now" />
            </Link>
         </div>
      </div>
   )
}

export default Ads
