import Link from "next/link";
import { useState } from "react";
import ReactPaginate from "react-paginate";
import BlogSidebar from "../blog-sidebar";
import { blogPosts as blog_data } from "../../../data/BlogData";
import Image from "next/image";
import { useTranslation } from "../../../context/LanguageContext";

const BlogArea = () => {
  const { t, lang } = useTranslation();
  const isTr = lang === "tr";

  const itemsPerPage = 4;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = blog_data.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(blog_data.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % blog_data.length;
    setItemOffset(newOffset);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(isTr ? "tr-TR" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="tg-blog-standard-area pt-130 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="tg-blog-standard-wrap tg-blog-lg-spacing mr-50">
              {currentItems.map((item) => (
                <div key={item.id} className="tg-blog-standard-item mb-40">
                  <div className="tg-blog-standard-thumb mb-15">
                    <Link href={`/blog/${item.slug}`}>
                      <Image
                        className="w-100"
                        src={item.thumb}
                        alt={isTr ? item.title_tr : item.title_en}
                        width={400}
                        height={300}
                      />
                    </Link>
                  </div>
                  <div className="tg-blog-standard-content">
                    <div className="tg-blog-standard-date mb-10">
                      <span>{item.author}</span>
                      <span>{formatDate(item.date)}</span>
                      <span>{item.readTime} {isTr ? "dk" : "min"}</span>
                    </div>
                    <h2 className="tg-blog-standard-title">
                      <Link href={`/blog/${item.slug}`}>
                        {isTr ? item.title_tr : item.title_en}
                      </Link>
                    </h2>
                    <p className="mb-20">{isTr ? item.summary_tr : item.summary_en}</p>
                    <div className="tg-blog-sidebar-btn">
                      <Link href={`/blog/${item.slug}`} className="tg-btn tg-btn-switch-animation">
                        {t.readMore}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              <div className="tg-pagenation-wrap text-center pt-60 mb-30">
                <nav>
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel={<i className="p-btn">{isTr ? "Sonraki" : "Next"}</i>}
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={3}
                    pageCount={pageCount}
                    previousLabel={<i className="p-btn">{isTr ? "Önceki" : "Previous"}</i>}
                    renderOnZeroPageCount={null}
                  />
                </nav>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogArea;
