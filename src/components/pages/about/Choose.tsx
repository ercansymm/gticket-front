import type { JSX } from "react";
import Choose6 from "../../../svg/home-one/Choose6";
import Choose7 from "../../../svg/home-one/Choose7";
import Choose8 from "../../../svg/home-one/Choose8";

interface DataType {
   id: number;
   icon: JSX.Element;
   title: string;
   desc: string;
}

const choose_data: DataType[] = [
   {
      id: 1,
      icon: (<><Choose6 /></>),
      title: "Esnek İptal & Değişiklik",
      desc: "Biletinizde değişiklik veya iptal işlemlerini kolayca yapın. Esnek fiyat seçenekleriyle seyahatinizi planlamak artık çok kolay.",
   },
   {
      id: 2,
      icon: (<><Choose7 /></>),
      title: "En Uygun Fiyat Garantisi",
      desc: "Tüm havayollarını tek seferde karşılaştırın. En uygun fiyatlı uçak biletlerini AtaBilet ayrıcalığıyla satın alın.",
   },
   {
      id: 3,
      icon: (<><Choose8 /></>),
      title: "7/24 Müşteri Desteği",
      desc: "Seyahat öncesinde, sırasında ve sonrasında profesyonel destek ekibimiz her zaman yanınızda.",
   },
];

const Choose = () => {
   return (
      <div className="tg-chose-area tg-grey-bg pt-140 pb-70 p-relative z-index-1">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-7 col-md-9">
                  <div className="tg-chose-section-title text-center mb-35">
                     <h5 className="tg-section-subtitle mb-15 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".1s">Neden AtaBilet?</h5>
                     <h2 className="mb-15 text-capitalize wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">En İyi Seyahat Deneyimini<br /> Sizin İçin Sunuyoruz</h2>
                     <p className="text-capitalize wow fadeInUp mb-35" data-wow-delay=".5s" data-wow-duration=".9s">Binlerce havayolu arasından en uygun fiyatlı uçak biletlerini
                        bulmanız için teknolojimizi ve deneyimimizi bir araya getiriyoruz.</p>
                  </div>
               </div>
            </div>
            <div className="row">
               {choose_data.map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6">
                     <div className="tg-chose-6-wrap mb-30">
                        <span className="icon mb-20">{item.icon}</span>
                        <h4 className="tg-chose-6-title mb-15">{item.title}</h4>
                        <p>{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}

export default Choose
