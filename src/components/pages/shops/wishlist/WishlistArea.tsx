/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import UseWishlistInfo from "../../../../hooks/UseWishlistInfo";
import { addToCart } from "../../../../redux/features/cartSlice";
import { removeFromWishlist } from "../../../../redux/features/wishlistSlice";

const WishlistArea = () => {
  const { wishlistItems } = UseWishlistInfo();
  const dispatch = useDispatch();

  return (
    <div className="cart-area pb-100 pt-105">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {wishlistItems.length === 0 ? (
              <div className="mb-30">
                <div className="empty_bag text-center">
                  <p className="py-3">Favori listeniz boş</p>
                  <Link href={"/"} className="tg-btn">
                     Uçuş Ara
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
                          <th>Ürün</th>
                          <th className="price">Fiyat</th>
                          <th className="product-quantity">Sepete Ekle</th>
                          <th>Kaldır</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wishlistItems.map((item: any, i: any) =>
                          <tr key={i}>
                            <td className="product-thumbnail">
                              <Link className="thumb" href="/">
                                <Image src={item.thumb} alt="" width={100} height={100} />
                              </Link>
                              <Link className="texts" href="/">{item.title}</Link>
                            </td>
                            <td className="product-price2">
                              <span className="amount">${item.price}.00</span>
                            </td>
                            <td className="product-add-to-cart">
                              <button onClick={() => dispatch(addToCart(item))} className="tg-btn">Sepete Ekle</button>
                            </td>
                            <td className="product-remove">
                              <a onClick={() => dispatch(removeFromWishlist(item))} style={{ cursor: "pointer" }}><i className="fa fa-times"></i></a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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

export default WishlistArea
