const products = [
    {
      id: 1,
      name: "Naruto Uzumaki Nendoroid",
      price: 120,
      image: "https://images-na.ssl-images-amazon.com/images/I/41qL7R-sEFL.jpg"
    },
    {
      id: 2,
      name: "Gojo Satoru Nendoroid",
      price: 150,
      image: "https://http2.mlstatic.com/D_NQ_NP_844515-MLM79389944373_092024-O.webp"
    },
    {
      id: 3,
      name: "Miku Hatsune Nendoroid",
      price: 130,
      image: "https://www.tradeinn.com/f/14253/142534222/good-smile-company-character-vocal-series-01-hatsune-miku-3.0-nendoroid-figura-basica-10-cm.webp"
    },
    {
      id: 4,
      name: "Levi Ackerman Nendoroid",
      price: 140,
      image: "https://m.media-amazon.com/images/I/51X4xlQJJ-L._SY250_.jpg"
    },
    {
      id: 5,
      name: "Izuku Midoriya Nendoroid",
      price: 110,
      image: "https://sgeek.pe/wp-content/uploads/2022/03/NENDOROID-IZUKU-MIDORIYA-STEALTH-SUIT-V.jpg"
    },
    {
      id: 6,
      name: "Eren Yeager Nendoroid",
      price: 125,
      image: "https://m.media-amazon.com/images/I/61vok08gXFL._AC_UF894,1000_QL80_.jpg"
    },
    {
    id: 7,
    name: "Tanjiro Kamado Nendoroid",
    price: 135,
    image: "https://sgeek.pe/wp-content/uploads/2022/03/NENDOROID-TANJIRO-KAMADO.jpg"
    },
    {
    id: 8,
    name: "Nezuko Kamado Nendoroid",
    price: 125,
    image: "https://m.media-amazon.com/images/I/6170r+wgGYL._AC_SL1409_.jpg"
    },
    {
    id: 9,
    name: "Sasuke Uchiha Nendoroid",
    price: 120,
    image: "https://m.media-amazon.com/images/I/41wPNJBtd-L._SS400_.jpg"
    }, 
    {
    id: 10,
    name: "Itachi Uchiha Nendoroid",
    price: 135,
    image: "https://i5.walmartimages.com/seo/7-Black-and-Red-Naruto-Shippuden-Itachi-Uchiha-Nendoroid-Figure_b6ead6f9-5621-491b-9676-9afa07f26b85.7db43e1ad35d3b94a6b32c992a3434a0.jpeg"
    }, 
    {
    id: 11,
    name: "Killua Zoldyck Nendoroid",
    price: 105,
    image: "https://m.media-amazon.com/images/I/41+TIb3jFyL._SS400_.jpg"
    }, 
    {
    id: 12,
    name: "Zenitsu Agatsuma Nendoroid",
    price: 115,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd3K3jQm_EXiroYpm-nFvP0MkgR4S1unaKSw&s"
    }, 
    {
    id: 13,
    name: "Inosuke Hashibira Nendoroid",
    price: 120,
    image: "https://media.entertainmentearth.com/assets/images/34e77aa224f04dea850536225ab554abxl.jpg"
    }, 
    {
    id: 14,
    name: "Kyojuro Rengoku Nendoroid",
    price: 130,
    image: "https://meccha-japan.com/434301-large_default/nendoroid-doll-kyojuro-rengoku-demon-slayer-kimetsu-no-yaiba.jpg"
    }, 
    {
    id: 15,
    name: "Toge Inumaki Nendoroid",
    price: 120,
    image: "https://i.ebayimg.com/images/g/YGsAAOSwdodjfdXr/s-l1200.jpg"
    }, 
    {
    id: 16,
    name: "Shoto Todoroki Nendoroid",
    price: 110,
    image: "https://media.falabella.com/falabellaPE/133712544_01/w=800,h=800,fit=pad"
    }, 
    {
    id: 17,
    name: "Katsuki Bakugo Nendoroid",
    price: 130,
    image: "https://sgeek.pe/wp-content/uploads/2023/07/figura-nendoroid-katsuki-bakugo-winter-cost-ver-64798-default-1.jpg"
    }, 
    { 
    id: 18,
    name: "All Might Nendoroid",
    price: 160,
    image: "https://m.media-amazon.com/images/S/aplus-media/vc/fb9ce708-4aaa-45cf-b897-a97d24382e00.__CR0,0,1000,1000_PT0_SX300_V1___.jpg"
    }, 
    {
    id: 19,
    name: "Asta Nendoroid",
    price: 105,
    image: "https://m.media-amazon.com/images/I/51GJ04kY0FL.jpg"
    }, 
    {
    id: 20,
    name: "Inuyasha Nendoroid",
    price: 110,
    image: "https://m.media-amazon.com/images/I/61VsYroNhKL._AC_UF894,1000_QL80_.jpg"
    }, 
    {
    id: 21,
    name: "Jotaro Kujo Nendoroid",
    price: 115,
    image: "https://goodsmileshop.com/medias/sys_master/images/images/ha4/hb0/9066582310942.jpg"
    }, 
    {
    id: 22,
    name: "Dio Brando Nendoroid",
    price: 120,
    image: "https://m.media-amazon.com/images/I/61XHz9TWRYL._AC_UF894,1000_QL80_.jpg"
    }, 
    {
    id: 23,
    name: "Asuna Yuuki Nendoroid",
    price: 105,
    image: "https://www.japanzon.com/194647-product_small/good-smile-company-nendoroid-sword-art-online-asuna-20-figure.jpg"
    }, 
    {
    id: 24,
    name: "Sakura Haruno Nendoroid",
    price: 130,
    image: "https://m.media-amazon.com/images/I/51SKVQpcMAL._AC_UF894,1000_QL80_.jpg"
    },
    {
    id: 25,
    name: "Yusuke Urameshi Nendoroid",
    price: 110,
    image: "https://kurogami.com/img/productos/31/ef/nendoroid-1221-yusuke-urameshi-yu-yu-hakusho-01.jpg"
  },
  {
    id: 26,
    name: "Joseph Joestar Nendoroid",
    price: 120,
    image: "https://images-cdn.ubuy.com.sa/66ab869b81dd300fd15e21d3-medicos-jojo-s-bizarre-adventure.jpg"
  },
  {
    id: 27,
    name: "Kenshin Himura Nendoroid",
    price: 105,
    image: "https://http2.mlstatic.com/D_NQ_NP_824355-MLU73687156048_012024-O.webp"
  },
   {
    id: 28,
    name: "Natsu Dragneel Nendoroid",
    price: 115,
    image: "https://media.falabella.com/falabellaPE/126765531_01/w=1500,h=1500,fit=cover"
  },
   {
    id: 29,
    name: "Madara Uchiha Nendoroid",
    price: 120,
    image: "https://goodsmileshop.com/medias/sys_master/images/images/hc6/h7b/9488578281502.jpg"
  },
   {
    id: 30,
    name: "Obito Uchiha Nendoroid",
    price: 130,
    image: "https://lafrikileria.com/215487-thickbox_default/figura-naruto-shippuden-nendoroid-pvc-obito-uchiha-10-cm.jpg"
  },
   {
    id: 31,
    name: "Tetsuro Kuroo Nendoroid",
    price: 115,
    image: "https://http2.mlstatic.com/D_NQ_NP_648230-MLU70981087599_082023-O.webp"
  },
   {
    id: 32,
    name: "Tobio Kageyama Nendoroid",
    price: 120,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxMsGH6PqaGv1i2m6tnFWoJkC8yW3MypEpVA&s"
  },
   {
    id: 33,
    name: "Chika Fujiwara Nendoroid",
    price: 135,
    image: "https://kurogami.com/med/img/productos/63/1b/NENDOROID_1434_CHIKA_FUJIWARA_KAGUYA_SAMA_LOVE_IS_WAR_RE_EDICION_1.jpg"
  },
   {
    id: 34,
    name: "Yato Nendoroid",
    price: 110,
    image: "https://m.media-amazon.com/images/I/51WQWkLWqUL._AC_UF894,1000_QL80_.jpg"
  },
   {
    id: 35,
    name: "Neji Hyuga Nendoroid",
    price: 115,
    image: "https://superanimestore.com/cdn/shop/products/61y1rSX_0VL._AC_SL1500.jpg?v=1626227197"
  },
   {
    id: 36,
    name: "Rock Lee Nendoroid",
    price: 145,
    image: "https://m.media-amazon.com/images/I/61HC4+dCqIL._AC_UF894,1000_QL80_.jpg"
  },
   {
    id: 37,
    name: "Jiraiya Nendoroid",
    price: 110,
    image: "https://atlantis-comics.com/cdn/shop/files/on3voafplkhjanmnvgwk.jpg?v=1736302867"
  },
   {
    id: 38,
    name: "Makima Nendoroid",
    price: 120,
    image: "https://http2.mlstatic.com/D_NQ_NP_716962-MLU73713429256_012024-O.webp"
  },
   {
    id: 39,
    name: "Panda Nendoroid",
    price: 125,
    image: "https://meccha-japan.com/256192-large_default/nendoroid-panda-jujutsu-kaisen.jpg"
  },
   {
    id: 40,
    name: "Denji Nendoroid",
    price: 140,
    image: "https://cddistribution.com/pe/wp-content/uploads/2023/02/TOYCOLGSM3780_1.jpg"
  },
   {
    id: 41,
    name: "Tony Tony Chopper Nendoroid",
    price: 135,
    image: "https://www.manga-news.com/public/images/goodies/one-piece-chopper-variable-actions-heroes-megahouse-1.jpeg"
  },
   {
    id: 42,
    name: "Monkey D. Luffy Nendoroid",
    price: 145,
    image: "https://i.pinimg.com/474x/04/91/80/0491803428c7667c5eab87a672924958.jpg"
  },
   {
    id: 43,
    name: "Yuji Itadori Nendoroid",
    price: 130,
    image: "https://http2.mlstatic.com/D_NQ_NP_805212-MLM49243486246_032022-O.webp"
  },
   {
    id: 44,
    name: "Ryomen Sukuna Nendoroid",
    price: 140,
    image: "https://http2.mlstatic.com/D_NQ_NP_958510-MLU73283208944_122023-O.webp"
  },
   {
    id: 45,
    name: "Mikasa Ackerman Nendoroid",
    price: 135,
    image: "https://media.falabella.com/falabellaPE/126694781_01/w=800,h=800,fit=pad"
  },
   {
    id: 46,
    name: "Armin Arlert Nendoroid",
    price: 125,
    image: "https://s.pacn.ws/1/p/13f/nendoroid-no-435-attack-on-titan-armin-arlert-rerun-709723.1.jpg?v=r74j0c"
  },
   {
    id: 47,
    name: "Kanao Tsuyuri Nendoroid",
    price: 120,
    image: "https://m.media-amazon.com/images/I/51EnWBxaEjL._AC_UF894,1000_QL80_.jpg"
  },
   {
    id: 48,
    name: "Power Nendoroid",
    price: 115,
    image: "https://resize.cdn.otakumode.com/ex/550.1288/shop/product/6dcf29a844954aafaf5f9a319de732b0.jpg"
  },
   {
    id: 49,
    name: "Ochaco Uraraka Nendoroid",
    price: 140,
    image: "https://m.media-amazon.com/images/S/aplus-media/vc/bab71333-e829-494d-873d-224005de82e8.__CR0,0,1000,1000_PT0_SX300_V1___.jpg"
  },
   {
    id: 50,
    name: "Shoyo Hinata Nendoroid",
    price: 135,
    image: "https://media.falabella.com/falabellaPE/141406506_01/w=1500,h=1500,fit=cover"
  },
  ];
  
  export default products;