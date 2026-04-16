"use client";

import { Info } from "lucide-react";

export default function RulesAccordion() {
  return (
    <div className="pnr-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="pnr-rules__header">
        <Info size={16} />
        <h3 className="pnr-rules__header-title">
          Genel Kurallar ve Bilgilendirmeler
        </h3>
      </div>
      <div className="pnr-rules__content">
        <p>
          Bilet ve bagaj kontrolü için; tarifeli kalkış saatinden iç hatlarda 60 DK., dış hatlarda 75 DK. önce Check-in işlemlerini tamamlamanız gerekmektedir.
        </p>
        <p>
          Havalimanı içerisinde yoğunluğun oluşmaması için yurt içi uçuşlardan 3 saat, yurt dışı uçuşlardan 4 saat önce havalimanında olunması ve Check-in işlemlerinin tamamlanması önerilmektedir.
        </p>
        <p>
          Uçuşun menziline göre (özellikle uzun menzilli uçuşlarda), havayolu kuralları ve olağanüstü durumlarda Check-in işlemleri daha erken bitebilmekte olup, uçuşunuzu gerçekleştireceğiniz havayolu web adresinden kontrol edilmelidir.
        </p>
        <p>
          Parça bagaj hakkı uygulaması kapsamında standart uygulamaya göre parça başı 23 KG'yi aşan bagajlar uçuşa kabul edilmemektedir. Parça bagaj hakkı havayolu özelinde değişebilmekte olup, uçuşunuzu gerçekleştireceğiniz havayolu web adresinden kontrol edilmelidir.
        </p>
        <p>
          Seyahat edilecek ülkeye geçerli bir vize, aktarmalı uçuşlarda ise geçerli bir transit vizeye sahip olunması yolcunun sorumluluğundadır. Geçerli bir vize/transit vizeye sahip olunmaması sebebiyle seyahatin gerçekleştirilememesi sonucu ortaya çıkacak zararlardan AtaBilet sorumlu değildir.
        </p>
        <p>
          Charter uçuşlarda saat değişikliği ve sefer iptallerinde bilgi rezervasyon esnasında girilen mail adresine gelmektedir. Bildirim sadece mail ile yapılmakta olup mesaj gönderilmemektedir.
        </p>
      </div>
    </div>
  );
}
