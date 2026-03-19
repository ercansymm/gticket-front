import Link from "next/link";

const tags: string[] = ["City Tour", "Hiking", "News", "Camping", "Social Media", "Travel", "Traffic",];

const Tags = () => {
   return (
      <div className="tg-blog-sidebar-tag tg-blog-sidebar-box">
         <h5 className="tg-blog-sidebar-title mb-25">Tags</h5>
         <div className="tg-blog-sidebar-tag-list">
            <ul>
               {tags.map((tag, i) => (
                  <li key={i}><Link href="#">{tag}</Link></li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default Tags
