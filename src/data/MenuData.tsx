
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
        title: "Ana Sayfa",
        link: "/",
        has_dropdown: false,
    },
    {
        id: 2,
        title: "Hakkımızda",
        link: "/about",
        has_dropdown: false,
    },
    {
        id: 3,
        title: "Bilet Sorgula",
        link: "/bilet-sorgula",
        has_dropdown: false,
    },
    {
        id: 4,
        title: "Blog",
        link: "/blog",
        has_dropdown: false,
    },
    {
        id: 5,
        title: "Sıkça Sorulan Sorular",
        link: "/faq",
        has_dropdown: false,
    },
    {
        id: 6,
        has_dropdown: false,
        title: "İletişim",
        link: "/contact",
    },
];

export default menu_data;