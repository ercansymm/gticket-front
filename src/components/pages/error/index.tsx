import FooterFive from "../../../layouts/footers/FooterFive"
import HeaderThree from "../../../layouts/headers/HeaderThree"
import BreadCrumb from "../../common/BreadCrumb"
import ErrorArea from "./ErrorArea"

const NotFound = () => {
  return (
    <>
      <HeaderThree />
      <main>
        <BreadCrumb title="404 Error Page" sub_title="404" />
        <ErrorArea />
      </main>
      <FooterFive />
    </>
  )
}

export default NotFound
