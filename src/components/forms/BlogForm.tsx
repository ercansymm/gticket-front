
const BlogForm = () => {

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <div className="row gx-15">
            <div className="col-lg-12">
               <textarea className="textarea  mb-5" placeholder="Yorum"></textarea>
            </div>
            <div className="col-lg-4 mb-15">
               <input className="input" type="text" placeholder="Ad Soyad" />
            </div>
            <div className="col-lg-4 mb-15">
               <input className="input" type="email" placeholder="E-posta" />
            </div>
            <div className="col-lg-4 mb-15">
               <input className="input" type="text" placeholder="Web Sitesi" />
            </div>
            <div className="col-lg-12">
               <div className="review-checkbox d-flex align-items-center mb-25">
                  <input className="tg-checkbox" type="checkbox" id="australia" />
                  <label htmlFor="australia" className="tg-label">Bir dahaki sefere yorum yapmak için adımı, e-postamı ve web sitemi bu tarayıcıya kaydet.</label>
               </div>
               <button type="submit" className="tg-btn tg-btn-switch-animation">
                  <span className="d-flex align-items-center justify-content-center">
                     <span className="btn-text">Yorum Gönder</span>
                     <span className="btn-icon ml-5">
                        <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1.0017 8.00001H19.9514M19.9514 8.00001L12.9766 1.02515M19.9514 8.00001L12.9766 14.9749" stroke="white" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </span>
                     <span className="btn-icon ml-5">
                        <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1.0017 8.00001H19.9514M19.9514 8.00001L12.9766 1.02515M19.9514 8.00001L12.9766 14.9749" stroke="white" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </span>
                  </span>
               </button>
            </div>
         </div>
      </form>
   )
}

export default BlogForm
