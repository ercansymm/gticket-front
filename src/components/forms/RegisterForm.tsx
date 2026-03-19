import Link from "next/link";

const RegisterForm = () => {

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <div className="row">
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="Enter your username" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="email" placeholder="Enter your email" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="Password" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="Confirm Password" />
            </div>
            <div className="col-lg-12">
               <div className="d-flex align-items-center justify-content-between">
                  <div className="review-checkbox d-flex align-items-center mb-25">
                     <input className="tg-checkbox" type="checkbox" id="australia" />
                     <label htmlFor="australia" className="tg-label">Remember me</label>
                  </div>
                  <div className="tg-login-navigate mb-25">
                     <Link href="/login">Log In</Link>
                  </div>
               </div>
               <button type="submit" className="tg-btn w-100">Sign Up</button>
            </div>
         </div>
      </form>
   )
}

export default RegisterForm
