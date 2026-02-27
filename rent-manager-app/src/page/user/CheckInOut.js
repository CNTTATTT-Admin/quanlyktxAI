import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { request } from "../../services/fetch/ApiUtils";
import { API_BASE_URL } from "../../constants/Connect";
import "./CheckInOut.css";

const CheckInOut = ({ currentUser }) => {
  const navigate = useNavigate();
  const videoRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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
        toast.error("Lỗi tải AI models. Vui lòng kiểm tra kết nối mạng.");
      }
    };
    loadModels();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
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
        toast.error("Không thể mở camera.");
      });
  };

  const handleAction = async (type) => {
    if (!modelsLoaded || isVerifying) return;
    setIsVerifying(true);

    const detections = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const faceVector = Array.from(detections.descriptor);

      request({
        url: `${API_BASE_URL}/auth/face-check?type=${type}`,
        method: "POST",
        body: JSON.stringify({
          userId: currentUser ? currentUser.id : null,
          faceVector: faceVector,
        }),
      })
        .then(() => {
          toast.success(
            `${type === "CHECK_IN" ? "Check-in" : "Check-out"} thành công!`,
          );
          navigate("/");
        })
        .catch((error) => {
          toast.error(error.message || "Xác thực khuôn mặt thất bại.");
        })
        .finally(() => setIsVerifying(false));
    } else {
      toast.warn("Không tìm thấy khuôn mặt. Vui lòng nhìn thẳng vào camera.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h2>Điểm danh khuôn mặt</h2>
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay muted />
          {loading && <div className="overlay">Đang khởi động camera...</div>}
          {isVerifying && <div className="scanning-bar"></div>}
        </div>
        <div className="button-group">
          <button
            className="btn-checkin"
            onClick={() => handleAction("CHECK_IN")}
            disabled={loading || isVerifying || !modelsLoaded}
          >
            Check-in
          </button>
          <button
            className="btn-checkout"
            onClick={() => handleAction("CHECK_OUT")}
            disabled={loading || isVerifying || !modelsLoaded}
          >
            Check-out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInOut;
