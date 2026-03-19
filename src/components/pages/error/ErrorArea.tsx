import Image from "next/image"
import Link from "next/link"

const ErrorArea = () => {
   return (
      <div className="tg-error-area-start tg-error-spacing">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-7 col-md-9">
                  <div className="tg-error-content text-center">
                     <Image className="mb-40" src="/assets/img/error/text.png" alt="error" width={400} height={100} />
                     <h2 className="mb-15">Error Page!</h2>
                     <p className="mb-35">Sorry! This Page is Not Available!</p>
                     <div className="tg-error-btn">
                        <Link className="tg-btn" href="/">Go Back To Home Page</Link>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default ErrorArea
