import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { registerFace } from "../../services/fetch/ApiUtils";
import { useNavigate } from "react-router-dom";
import "./FaceRegistration.css";

const FaceRegistration = ({ currentUser }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        startVideo();
      } catch (error) {
        console.error("Error loading models:", error);
        toast.error("Không thể tải models nhận diện khuôn mặt.");
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setLoading(true);
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Không thể mở camera. Vui lòng kiểm tra quyền truy cập.");
      });
  };

  const handleRegister = async () => {
    if (!modelsLoaded) return;
    setIsRegistering(true);

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const faceVector = Array.from(detections.descriptor);
        const faceRequest = {
          userId: currentUser.id,
          faceVector: faceVector,
        };

        registerFace(faceRequest)
          .then((response) => {
            toast.success("Đăng ký khuôn mặt thành công!");
            window.location.href = "/"; // Force reload to update filter state
          })
          .catch((error) => {
            toast.error(error.message || "Đăng ký khuôn mặt thất bại.");
            setIsRegistering(false);
          });
      } else {
        toast.warn("Không tìm thấy khuôn mặt. Vui lòng điều chỉnh vị trí.");
        setIsRegistering(false);
      }
    } catch (error) {
      console.error("Error during face registration:", error);
      toast.error("Có lỗi xảy ra trong quá trình nhận diện.");
      setIsRegistering(false);
    }
  };

  return (
    <div className="face-registration-container">
      <h2>Đăng ký khuôn mặt (Face ID)</h2>
      <p>Vui lòng nhìn thẳng vào camera để hoàn tất đăng ký.</p>
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay muted width="640" height="480" />
        {loading && (
          <div className="loading-overlay">Đang khởi tạo camera...</div>
        )}
      </div>
      <div className="action-buttons">
        <button
          onClick={handleRegister}
          disabled={isRegistering || loading || !modelsLoaded}
          className={`btn-register ${isRegistering ? "processing" : ""}`}
        >
          {isRegistering ? (
            <>
              <span className="spinner"></span>
              Đang xử lý...
            </>
          ) : (
            "Xác thực khuôn mặt"
          )}
        </button>
      </div>
    </div>
  );
};

export default FaceRegistration;
