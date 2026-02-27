import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-toastify";
import { faceLogin } from "../../services/fetch/ApiUtils";
import { ACCESS_TOKEN } from "../../constants/Connect";
import "./FaceLogin.css";

const FaceLogin = ({ onSuccess }) => {
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
        toast.error("Không thể mở camera.");
      });
  };

  const handleFaceLogin = async () => {
    if (!modelsLoaded || isVerifying) return;
    setIsVerifying(true);

    const detections = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections) {
      const faceVector = Array.from(detections.descriptor);

      faceLogin(faceVector)
        .then((response) => {
          localStorage.setItem(ACCESS_TOKEN, response.accessToken);
          toast.success("Đăng nhập bằng khuôn mặt thành công!");
          onSuccess();
        })
        .catch((error) => {
          toast.error(error.message || "Không nhận diện được khuôn mặt.");
        })
        .finally(() => setIsVerifying(false));
    } else {
      toast.warn("Vui lòng nhìn thẳng vào camera.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="face-login-container">
      <div className="video-wrapper-small">
        <video ref={videoRef} autoPlay muted width="320" height="240" />
        {loading && <div className="loading-overlay-small">...</div>}
        {isVerifying && <div className="scanning-line"></div>}
      </div>
      <button
        onClick={handleFaceLogin}
        className="btn-face-login"
        disabled={loading || isVerifying || !modelsLoaded}
      >
        {isVerifying ? "Đang quét..." : "Xác nhận khuôn mặt"}
      </button>
    </div>
  );
};

export default FaceLogin;
