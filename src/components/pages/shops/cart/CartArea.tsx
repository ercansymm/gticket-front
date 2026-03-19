/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import UseCartInfo from "../../../../hooks/UseCartInfo";
import { addToCart, decrease_quantity, remove_cart_product } from "../../../../redux/features/cartSlice";

const CartArea = () => {
   
   const [mounted, setMounted] = useState(false);
   const productItem = useSelector((state: any) => state.cart.cart);
   const dispatch = useDispatch();
   const { total } = UseCartInfo();

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) return null;

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
   };

   return (
      <div className="cart-area pb-100 pt-105">
         <div className="container">
            <div className="row">
               <div className="col-12">
                  {productItem.length === 0 ? (
                     <div className="mb-30">
                        <div className="empty_bag text-center">
                           <p className="py-3">Your Bag is Empty</p>
                           <Link href={"/shop"} className="tg-btn">
                              Go To Shop
                           </Link>
                        </div>
                     </div>
                  ) : (
                     <form onClick={(e) => e.preventDefault()}>
                        <div className="row gutter-y-30 gx-5">
                           <div className="tg-cart-table-content table-responsive mb-30">
                              <table className="table">
                                 <thead>
                                    <tr>
                                       <th>Item</th>
                                       <th className="price">Price</th>
                                       <th>Quantity</th>
                                       <th className="subtotal">Subtotal</th>
                                       <th>Remove</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {productItem.map((item: any, i: any) =>
                                       <tr key={i}>
                                          <td className="product-thumbnail">
                                             <Link className="thumb" href="/shop-details">
                                                <Image src={item.thumb} alt="" width={80} height={80} />
                                             </Link>
                                             <Link className="texts" href="/shop-details">{item.title}</Link>
                                          </td>
                                          <td className="product-price2">
                                             <span className="amount">${item.price}.00</span>
                                          </td>
                                          <td className="product-quantity">
                                             <div className="tg-product-details-quantity">
                                                <div className="tg-booking-quantity-item">
                                                   <span onClick={() => dispatch(decrease_quantity(item))} className="decrement">
                                                      <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                         <path d="M1 1H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                      </svg>
                                                   </span>
                                                   <input className="tg-quantity-input" type="text" onChange={handleSubmit} value={item.quantity} readOnly />
                                                   <span onClick={() => dispatch(addToCart(item))} className="increment">
                                                      <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                         <path d="M1.21924 7H13.3836" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                         <path d="M7.30176 13V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                      </svg>
                                                   </span>
                                                </div>
                                             </div>
                                          </td>

                                          <td className="product-subtotal"><span className="amount">${item.price * item.quantity}.00</span></td>
                                          <td className="product-remove">
                                             <a onClick={() => dispatch(remove_cart_product(item))} style={{ cursor: "pointer" }}><i className="fa fa-times"></i></a>
                                          </td>
                                       </tr>
                                    )}
                                 </tbody>
                              </table>
                           </div>
                           <div className="row">
                              <div className="col-xl-9 col-lg-8 col-md-7">
                                 <div className="tg-cart-coupon-all mb-20">
                                    <input className="tg-input mb-10" placeholder="Enter Coupun Code" type="text" />
                                    <button className="tg-btn" type="submit">Apply Coupon</button>
                                 </div>
                              </div>
                              <div className="col-xl-3 col-lg-4 col-md-5">
                                 <div className="tg-cart-page-total mb-20">
                                    <ul className="mb-20">
                                       <li>Subtotal <span>${total.toFixed(2)}</span></li>
                                       <li className="borders">Shopping <span>$0.00</span></li>
                                       <li>Total <span>${total.toFixed(2)}</span></li>
                                    </ul>
                                    <div className="d-flex justify-content-between">
                                       <Link href="#" className="tg-btn tg-btn-black mb-10">Update</Link>
                                       <Link href="/checkout" className="tg-btn mb-10">Checkout</Link>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </form>
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}

export default CartArea