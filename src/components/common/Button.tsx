interface BtnText {
   text: string;
}
const Button = ({ text }: BtnText) => {
   return (
      <span className="d-flex align-items-center justify-content-center">
         <span className="btn-text">{text}</span>
         <span className="btn-icon ml-5">
            <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M1.0017 8.00001H19.9514M19.9514 8.00001L12.9766 1.02515M19.9514 8.00001L12.9766 14.9749" stroke="currentColor" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
         </span>
         <span className="btn-icon ml-5">
            <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M1.0017 8.00001H19.9514M19.9514 8.00001L12.9766 1.02515M19.9514 8.00001L12.9766 14.9749" stroke="currentColor" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
         </span>
      </span>
   )
}

export default Button
