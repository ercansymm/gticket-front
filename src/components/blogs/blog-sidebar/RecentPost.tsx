import Link from "next/link";
import Image from "next/image";

interface DataType {
   id: number;
   img: string;
   title: string;
   date: string;
}

const recent_data: DataType[] = [
   {
      id: 1,
      img: "/assets/img/blog/sidebar/post-2.jpg",
      title: "Europe’s finest and most scenic",
      date: " 26th Sep, 2024"
   },
   {
      id: 2,
      img: "/assets/img/blog/sidebar/post-3.jpg",
      title: "The 5 best hikes around the world",
      date: " 26th Sep, 2024"
   },
   {
      id: 3,
      img: "/assets/img/blog/sidebar/post-4.jpg",
      title: "The Surfing Man Will Blow Your Mind",
      date: " 26th Sep, 2024"
   },
   {
      id: 4,
      img: "/assets/img/blog/sidebar/post.jpg",
      title: "Girlfriend Getaway at Rosewood",
      date: " 26th Sep, 2024"
   },
];

const RecentPost = () => {
   return (
      <div className="tg-blog-post tg-blog-sidebar-box mb-40">
         <h5 className="tg-blog-sidebar-title mb-25">Son Yazılar</h5>
         {recent_data.map((item) => (
            <div key={item.id} className="tg-blog-post-item d-flex align-items-center">
               <div className="tg-blog-post-thumb mr-15">
                  <Image src={item.img} alt="post" width={100} height={80} />
               </div>
               <div className="tg-blog-post-content w-100">
                  <h4 className="tg-blog-post-title mb-5"><Link href="/blog">{item.title}</Link></h4>
                  <span className="tg-blog-post-date">
                     <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.76501 0.777832V3.26675M4.23413 0.777832V3.26675M0.777344 5.75554H13.2218M2.16006 2.02217H11.8391C12.6027 2.02217 13.2218 2.57933 13.2218 3.26662V11.9778C13.2218 12.6651 12.6027 13.2223 11.8391 13.2223H2.16006C1.39641 13.2223 0.777344 12.6651 0.777344 11.9778V3.26662C0.777344 2.57933 1.39641 2.02217 2.16006 2.02217Z" stroke="#1A56DB" strokeWidth="0.977778" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                     {item.date}
                  </span>
               </div>
            </div>
         ))}
      </div>
   )
}

export default RecentPost
