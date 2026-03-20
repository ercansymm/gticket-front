import BlogDetailsArea from "./BlogDetailsArea"
import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import TrustBar from "../../homes/home-one/TrustBar"
import BreadCrumb from "../../common/BreadCrumb"

const BlogDetails = () => {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main>
        <BreadCrumb title="Blog Detay" sub_title="Blog" />
        <BlogDetailsArea />
      </main>
      <FooterOne />
    </>
  )
}

export default BlogDetails
