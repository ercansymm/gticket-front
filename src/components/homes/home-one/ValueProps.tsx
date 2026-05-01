import { useTranslation } from "../../../context/LanguageContext";

/** AtaBilet — Hero ile Popüler Rotalar arasında konumlanan değer önerisi şeridi.
 *  Sade, ikonlu ve kurumsal görünüm. Emoji kullanılmaz; FontAwesome ikonları tercih edilir. */
const ValueProps = () => {
   const { lang } = useTranslation();
   const isTr = lang === "tr";

};

export default ValueProps;
