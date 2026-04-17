"use client";

import { useState } from "react";
import { Info, Luggage, Clock, Ban, ChevronDown } from "lucide-react";

interface AccordionSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

const sections: AccordionSection[] = [
  {
    id: "rules",
    icon: <Info size={16} />,
    title: "Genel Kurallar ve Bilgilendirmeler",
    content: (
      <>
        <p>
          Bilet ve bagaj kontrolü için; tarifeli kalkış saatinden iç hatlarda 60
          DK., dış hatlarda 75 DK. önce Check-in işlemlerini tamamlamanız
          gerekmektedir.
        </p>
        <p>
          Havalimanı içerisinde yoğunluğun oluşmaması için yurt içi uçuşlardan
          3 saat, yurt dışı uçuşlardan 4 saat önce havalimanında olunması ve
          Check-in işlemlerinin tamamlanması önerilmektedir.
        </p>
        <p>
          Uçuşun menziline göre (özellikle uzun menzilli uçuşlarda), havayolu
          kuralları ve olağanüstü durumlarda Check-in işlemleri daha erken
          bitebilmekte olup, uçuşunuzu gerçekleştireceğiniz havayolu web
          adresinden kontrol edilmelidir.
        </p>
      </>
    ),
  },
  {
    id: "baggage",
    icon: <Luggage size={16} />,
    title: "Bagaj Bilgileri",
    content: (
      <>
        <p>
          Parça bagaj hakkı uygulaması kapsamında standart uygulamaya göre parça
          başı 23 KG&apos;yi aşan bagajlar uçuşa kabul edilmemektedir. Parça bagaj
          hakkı havayolu özelinde değişebilmekte olup, uçuşunuzu
          gerçekleştireceğiniz havayolu web adresinden kontrol edilmelidir.
        </p>
        <p>
          El bagajı hakkı havayoluna ve bilet sınıfına göre değişmektedir.
          Standart uygulamada el bagajı 8 KG ile sınırlıdır. Detaylı bilgi için
          havayolu şirketinin web sitesini kontrol ediniz.
        </p>
      </>
    ),
  },
  {
    id: "checkin",
    icon: <Clock size={16} />,
    title: "Check-in ve Uçuş Bilgileri",
    content: (
      <>
        <p>
          Online check-in işlemi uçuştan 24 saat önce açılmaktadır. Havayolu
          şirketinin web sitesi veya mobil uygulaması üzerinden online check-in
          yapabilirsiniz.
        </p>
        <p>
          Charter uçuşlarda saat değişikliği ve sefer iptallerinde bilgi
          rezervasyon esnasında girilen mail adresine gelmektedir. Bildirim
          sadece mail ile yapılmakta olup mesaj gönderilmemektedir.
        </p>
        <p>
          Seyahat edilecek ülkeye geçerli bir vize, aktarmalı uçuşlarda ise
          geçerli bir transit vizeye sahip olunması yolcunun sorumluluğundadır.
        </p>
      </>
    ),
  },
  {
    id: "cancel",
    icon: <Ban size={16} />,
    title: "İptal ve Değişiklik Koşulları",
    content: (
      <>
        <p>
          Bilet iptali ve değişiklik kuralları, satın alınan bilet sınıfına ve
          havayolunun genel koşullarına göre farklılık göstermektedir.
        </p>
        <p>
          Promosyonlu biletlerde iade ve değişiklik yapılamayabilir. İade
          yapılabilen biletlerde kesinti uygulanabilir. Detaylı bilgi için
          müşteri hizmetlerimiz ile iletişime geçebilirsiniz.
        </p>
        <p>
          Geçerli bir vize/transit vizeye sahip olunmaması sebebiyle seyahatin
          gerçekleştirilememesi sonucu ortaya çıkacak zararlardan GBilet sorumlu
          değildir.
        </p>
      </>
    ),
  },
];

export default function RulesAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="pnr-card" style={{ padding: 0, overflow: "hidden" }}>
      {sections.map((section, idx) => {
        const isOpen = openId === section.id;
        const isLast = idx === sections.length - 1;
        return (
          <div key={section.id}>
            <button
              type="button"
              className={`pnr-accordion__trigger${isOpen ? " pnr-accordion__trigger--open" : ""}`}
              onClick={() => toggle(section.id)}
              aria-expanded={isOpen}
            >
              <span className="pnr-accordion__trigger-left">
                {section.icon}
                <span className="pnr-accordion__trigger-title">
                  {section.title}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`pnr-accordion__chevron${isOpen ? " pnr-accordion__chevron--open" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="pnr-accordion__panel">
                {section.content}
              </div>
            )}
            {!isLast && <div className="pnr-accordion__separator" />}
          </div>
        );
      })}
    </div>
  );
}
