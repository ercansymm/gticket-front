/* eslint-disable @typescript-eslint/no-explicit-any */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Controller } from "swiper/modules";
import { type JSX, useState } from "react"
import Image from "next/image";

const avatar_data: string[] = [
   "/assets/img/testimonial/tes-4/tes-1.webp",
   "/assets/img/testimonial/tes-4/tes-2.webp",
   "/assets/img/testimonial/tes-4/tes-3.webp",
   "/assets/img/testimonial/tes-4/tes-4.webp",
   "/assets/img/testimonial/tes-4/tes-2.webp",];

interface DataType {
   id: number;
   name: string;
   designation: string
   desc: JSX.Element;
   rating: string[];
}

const testi_data: DataType[] = [
   {
      id: 1,
      name: "Mr.Robey Alexa",
      designation: "CEO, logistra Agency",
      rating: ["fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star",],
      desc: (<>“ Morem ipsum dolor sit amet, consectetur adipisc Service follwing arrea fowlwo awing  elita florai sum dolor sit amet, consectetur area raweaeaw ecall edBorem<br /> ipsum dolor sit amet, consectetur.”</>),
   },
   {
      id: 2,
      name: "Jamie L. Jorgensen",
      designation: "CEO, logistra Agency",
      rating: ["fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star",],
      desc: (<>“ Morem ipsum dolor sit amet, consectetur adipisc Service follwing arrea fowlwo awing  elita florai sum dolor sit amet, consectetur area raweaeaw ecall edBorem<br /> ipsum dolor sit amet, consectetur.”</>),
   },
   {
      id: 3,
      name: "Mr.Robey Alexa",
      designation: "CEO, logistra Agency",
      rating: ["fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star",],
      desc: (<>“ Morem ipsum dolor sit amet, consectetur adipisc Service follwing arrea fowlwo awing  elita florai sum dolor sit amet, consectetur area raweaeaw ecall edBorem<br /> ipsum dolor sit amet, consectetur.”</>),
   },
   {
      id: 4,
      name: "Jason Whitmore",
      designation: "Founder",
      rating: ["fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star",],
      desc: (<>“ Morem ipsum dolor sit amet, consectetur adipisc Service follwing arrea fowlwo awing  elita florai sum dolor sit amet, consectetur area raweaeaw ecall edBorem<br /> ipsum dolor sit amet, consectetur.”</>),
   },
   {
      id: 5,
      name: "Jamie L. Jorgensen",
      designation: "CEO, logistra Agency",
      rating: ["fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star", "fa-sharp fa-solid fa-star",],
      desc: (<>“ Morem ipsum dolor sit amet, consectetur adipisc Service follwing arrea fowlwo awing  elita florai sum dolor sit amet, consectetur area raweaeaw ecall edBorem<br /> ipsum dolor sit amet, consectetur.”</>),
   },
];

const setting1 = {
   slidesPerView: 4,
   loop: true,
   autoplay: false,
   pagination: false,
   navigation: {
      prevEl: ".tg-testimonial-4-slide-prev",
      nextEl: ".tg-testimonial-4-slide-next",
   },
};

const setting2 = {
   slidesPerView: 1,
   loop: true,
   spaceBetween: 30,
   autoplay: false,
   pagination: false,
   navigation: {
      prevEl: ".tg-testimonial-4-slide-prev",
      nextEl: ".tg-testimonial-4-slide-next",
   },
};

const Testimonial = () => {

   const [thumbSwiper, setThumbSwiper] = useState<any>(null);
   const [contentSwiper, setContentSwiper] = useState<any>(null);

   return (
      <div className="tg-testimonial-area tg-testimonial-su-wrap p-relative pt-160 pb-50">
         <Image className="tg-testimonial-su-shape d-none d-xxl-block" src="/assets/img/testimonial/su/shape.webp" alt="" width={200} height={200} />
         <Image className="tg-testimonial-su-shape-2 d-none d-lg-block" src="/assets/img/testimonial/su/shape-2.webp" alt="" width={200} height={200} />
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-10">
                  <div className="tg-testimonial-4-wrap">
                     <div className="row justify-content-center">
                        <div className="tg-testimonial-qoute-wrap text-center mb-25">
                           <span>
                              <svg width="60" height="44" viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M4.28571 44H17.1429L25.7143 26.4V0H0V26.4H12.8571L4.28571 44ZM38.5714 44H51.4286L60 26.4V0H34.2857V26.4H47.1429L38.5714 44Z" fill="#7C37FF" />
                              </svg>
                           </span>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-6 col-10">
                           <Swiper {...setting1}
                              modules={[Navigation, Controller]}
                              onSwiper={setThumbSwiper}
                              controller={{ control: contentSwiper }} className="swiper-container tg-testimonial-4-thumb-active mb-25 fix p-relative">
                              {avatar_data.map((img, i) => (
                                 <SwiperSlide key={i} className="swiper-slide">
                                    <div className="tg-testimonial-4-slider-thumb">
                                       <Image src={img} alt="" width={80} height={80} />
                                    </div>
                                 </SwiperSlide>
                              ))}
                           </Swiper>
                        </div>
                     </div>
                     <Swiper  {...setting2}
                        modules={[Navigation, Controller]}
                        onSwiper={setContentSwiper}
                        controller={{ control: thumbSwiper }} className="swiper-container tg-testimonial-4-slide-active p-relative fix pb-20">
                        {testi_data.map((item) => (
                           <SwiperSlide key={item.id} className="swiper-slide">
                              <div className="tg-testimonial-4-content-wrap">
                                 <div className="tg-testimonial-4-clients text-center">
                                    <h5 className="tg-testimonial-4-name mb-0">{item.name}</h5>
                                    <span className="d-inline-block mb-10">{item.designation}</span>
                                    <div className="tg-testimonial-4-ratings mb-20">
                                       {item.rating.map((rating, i) => (
                                          <i key={i} className={rating}></i>
                                       ))}
                                    </div>
                                    <p>{item.desc}</p>
                                 </div>
                              </div>
                           </SwiperSlide>
                        ))}
                        <div className="tg-testimonial-4-slider-navigation">
                           <button className="tg-testimonial-4-slide-next"><i className="fa-solid fa-arrow-right-long"></i></button>
                           <button className="tg-testimonial-4-slide-prev"><i className="fa-solid fa-arrow-left-long"></i></button>
                        </div>
                     </Swiper>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Testimonial
