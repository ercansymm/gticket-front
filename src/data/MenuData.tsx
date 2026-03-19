
interface MenuItem {
    id: number;
    title: string;
    link: string;
    has_dropdown: boolean;
    sub_menus?: {
        link: string;
        title: string;
    }[];
}

const menu_data: MenuItem[] = [
    {
        id: 1,
        title: "Home",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/", title: "Home One" },
        ],
    },
    {
        id: 2,
        title: "Pages",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/about", title: "About" },
            { link: "/cart", title: "Cart" },
            { link: "/wishlist", title: "Wishlist" },
            { link: "/checkout", title: "Checkout" },
            { link: "/pricing", title: "Pricing" },
            { link: "/faq", title: "Faq" },
            { link: "/login", title: "Log In" },
            { link: "/register", title: "Register" },
            { link: "/no-found", title: "Error" },
        ],
    },
    {
        id: 3,
        title: "Blogs",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/blog-grid", title: "Blog Grid" },
            { link: "/blog-standard", title: "Blog Standard" },
            { link: "/blog-details", title: "Blog Details" },
        ],
    },
    {
        id: 4,
        has_dropdown: false,
        title: "Contact",
        link: "/contact",
    },
];

export default menu_data;