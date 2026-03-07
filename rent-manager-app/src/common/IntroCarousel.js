import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { getActiveBanners } from "../services/fetch/ApiUtils";
import { API_BASE_URL } from "../constants/Connect";

const IntroCarosel = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    getActiveBanners()
      .then((res) => {
        // Sort by orderIndex and take only the first 5
        const sortedBanners = res
          .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
          .slice(0, 5);
        setBanners(sortedBanners);
      })
      .catch((err) => console.error("Could not fetch banners", err));
  }, []);

  if (!banners || banners.length === 0) {
    return null; // or render a default fallback if desired
  }

  return (
    <>
      <div className="intro intro-carousel swiper position-relative">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="swiper-wrapper"
        >
          {banners.map((banner) => (
            <SwiperSlide
              key={banner.id}
              className="carousel-item-b swiper-slide"
            >
              <div className="relative w-full h-[500px] overflow-hidden">
                {/* Ảnh nền */}
                <img
                  src={
                    banner.imageUrl
                      ? API_BASE_URL + "/document/" + banner.imageUrl
                      : "assets/img/slide-1.jpg"
                  }
                  className="absolute w-full h-full object-cover"
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                  alt="Banner"
                />

                {/* Lớp phủ chuẩn (sử dụng style nội tuyến để mô phỏng Tailwind trong CSS thuần nếu dự án ko build Tailwind chuẩn,
                     nhưng cũng đính class Tailwind theo yêu cầu) */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 100%)",
                    zIndex: 10,
                    width: "100%",
                    height: "100%",
                    top: 0,
                    left: 0,
                  }}
                ></div>

                {/* Nội dung */}
                <div
                  className="absolute inset-0 z-20 flex flex-col justify-center text-left px-4"
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 10%",
                    color: "white",
                  }}
                >
                  <div className="container mx-auto">
                    <p
                      className="intro-title-top mb-2"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                        maxWidth: "500px",
                        color: "#ddd",
                      }}
                    >
                      {banner.subtitle}
                    </p>
                    <h1
                      className="intro-title"
                      style={{
                        fontSize: "3rem",
                        fontWeight: "bolder",
                        color: "white",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
                        maxWidth: "600px",
                      }}
                    >
                      {banner.title}
                    </h1>
                    <p className="intro-subtitle intro-price mt-2">
                      <a
                        href={banner.url || "/rental-home"}
                        className="btn btn-primary"
                        style={{
                          backgroundColor: "#2eca6a",
                          border: "none",
                          padding: "12px 30px",
                          fontSize: "1.2rem",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "50px",
                          fontWeight: "bold",
                        }}
                      >
                        <span>{banner.buttonText}</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="swiper-pagination"></div>
    </>
  );
};

export default IntroCarosel;
