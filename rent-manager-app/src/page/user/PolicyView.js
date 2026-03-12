import React, { useEffect, useState } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import { toast } from "react-toastify";
import { getPolicy } from "../../services/fetch/ApiUtils";

const PolicyView = (props) => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPolicy()
      .then((response) => {
        setPolicy(response);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Không thể tải nội quy. Vui lòng thử lại sau!");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header
        authenticated={props.authenticated}
        currentUser={props.currentUser}
        onLogout={props.onLogout}
      />
      <main id="main">
        <section className="intro-single">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-lg-8">
                <div className="title-single-box">
                  <h1 className="title-single">Nội quy chung</h1>
                  <span className="color-text-a">Các quy định và nội quy tại Kí túc xá</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="contact-single p-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="bg-white p-5 rounded shadow-sm border">
                  {loading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                    </div>
                  ) : policy ? (
                    <>
                      <h2 className="text-center text-primary mb-5 display-6 fw-bold border-bottom pb-4">
                        {policy.title}
                      </h2>
                      <div 
                        className="policy-body text-dark" 
                        style={{ 
                          whiteSpace: 'pre-line', 
                          lineHeight: '2', 
                          fontSize: '1.2rem',
                          textAlign: 'justify'
                        }}
                      >
                        {policy.content}
                      </div>
                      <div className="mt-5 pt-3 border-top text-muted small">
                        Ngày cập nhật cuối cùng: {new Date(policy.updatedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-5">
                      <h3>Nội quy đang được cập nhật...</h3>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PolicyView;
