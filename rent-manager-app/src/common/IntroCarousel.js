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
            <div 
              className="position-relative w-100 overflow-hidden"
              style={{ height: "65vh", minHeight: "500px" }}
            >
              <img
                src={
                  banner.imageUrl
                    ? API_BASE_URL + "/document/" + banner.imageUrl
                    : "assets/img/slide-1.jpg"
                }
                className="position-absolute w-100 h-100"
                style={{
                  objectFit: "cover",
                  top: 0,
                  left: 0,
                }}
                alt="Banner"
              />

              <div
                className="position-absolute w-100 h-100"
                style={{
                  background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              ></div>

              <div
                className="position-absolute w-100 h-100 d-flex flex-column justify-content-center"
                style={{ zIndex: 2, top: 0, left: 0 }}
              >
                <div className="container">
                  <div className="row">
                    <div className="col-md-8 col-lg-6 text-start">
                      <p
                        className="text-uppercase fw-bold mb-3"
                        style={{
                          fontSize: "1.2rem",
                          color: "#e0e0e0",
                          letterSpacing: "2px",
                          textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                        }}
                      >
                        {banner.subtitle}
                      </p>
                      <h1
                        className="display-4 fw-bolder text-white mb-4"
                        style={{
                          textShadow: "2px 2px 5px rgba(0,0,0,0.8)",
                          lineHeight: "1.2",
                        }}
                      >
                        {banner.title}
                      </h1>
                      <a
                        href={banner.url || "/rental-home"}
                        className="btn btn-success btn-lg px-4 py-2 rounded-pill shadow"
                        style={{ backgroundColor: "#2eca6a", borderColor: "#2eca6a", fontWeight: "600" }}
                      >
                        {banner.buttonText || "Xem thêm"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default IntroCarosel;