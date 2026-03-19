import Ads from "./Ads"
import Category from "./Category"
import RecentPost from "./RecentPost"
import Tags from "./Tags"

const BlogSidebar = () => {
   return (
      <div className="tg-blog-sidebar top-sticky mb-30">
         <div className="tg-blog-sidebar-search tg-blog-sidebar-box mb-40">
            <h5 className="tg-blog-sidebar-title mb-15">Search</h5>
            <div className="tg-blog-sidebar-form">
               <form onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Type here . . ." />
                  <button>
                     <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_497_1336)">
                           <path d="M17 17L13.5247 13.5247M15.681 8.3405C15.681 12.3945 12.3945 15.681 8.3405 15.681C4.28645 15.681 1 12.3945 1 8.3405C1 4.28645 4.28645 1 8.3405 1C12.3945 1 15.681 4.28645 15.681 8.3405Z" stroke="#E30A17" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                        <defs>
                           <clipPath id="clip0_497_1336">
                              <rect width="18" height="18" fill="white" />
                           </clipPath>
                        </defs>
                     </svg>
                  </button>
               </form>
            </div>
         </div>
         <Category />
         <RecentPost />
         <Ads />
         <Tags />
      </div>
   )
}

export default BlogSidebar
