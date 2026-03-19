/* eslint-disable @typescript-eslint/no-explicit-any */
import ScrollToTop from "../components/common/ScrollToTop";

const Wrapper = ({ children }: any) => {

    return <>
        {children}
        <ScrollToTop />
    </>;
}

export default Wrapper
