import FaqArea from "./FaqArea";
import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import TrustBar from "../../homes/home-one/TrustBar";

const Faq = () => {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main className="faq-page">
        <FaqArea />
      </main>
      <FooterOne />
    </>
  );
};

export default Faq;
