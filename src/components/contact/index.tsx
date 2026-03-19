import FooterFive from "../../layouts/footers/FooterFive"
import HeaderThree from "../../layouts/headers/HeaderThree"
import BreadCrumb from "../common/BreadCrumb"
import ContactArea from "./ContactArea"

const Contact = () => {
   return (
      <>
         <HeaderThree />
         <main>
            <BreadCrumb title="Contact With Us" sub_title="Contact" />
            <ContactArea />
         </main>
         <FooterFive />
      </>
   )
}

export default Contact
