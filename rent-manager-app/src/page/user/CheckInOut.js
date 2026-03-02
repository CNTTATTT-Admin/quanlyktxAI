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
  const [livenessState, setLivenessState] = useState(null); // 'WAITING', 'DOWN', 'SUCCESS'
  const [livenessMsg, setLivenessMsg] = useState("");
  const [currentEAR, setCurrentEAR] = useState(0);
  const [enableLiveness, setEnableLiveness] = useState(true);

  const EAR_THRESHOLD_DOWN = 0.25; // Ngưỡng nhắm mắt
  const EAR_THRESHOLD_UP = 0.28; // Ngưỡng mở mắt
  const CONFIDENCE_FRAMES = 1;
  const blinkFramesCount = useRef(0);
  const blinkState = useRef("WAITING");

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

    // Fetch liveness configuration from backend
    request({
      url: `${API_BASE_URL}/auth/config/face-liveness`,
      method: "GET",
    })
      .then((response) => {
        setEnableLiveness(response === true);
      })
      .catch((error) => {
        console.error("Error fetching liveness config:", error);
      });

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

  const dist = (p1, p2) => {
    if (!p1 || !p2) return 0;
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const calculateEAR = (landmarks) => {
    // 1. Kiểm tra xem landmarks có tồn tại không
    if (!landmarks || typeof landmarks.getLeftEye !== "function") {
      console.warn("Chưa nhận được Landmarks hợp lệ");
      return 0;
    }

    const getEyeEAR = (eyePoints) => {
      // eyePoints là mảng 6 điểm [{x, y}, ...]
      // Kiểm tra nếu mảng rỗng hoặc thiếu điểm
      if (!eyePoints || eyePoints.length < 6) return 0;

      const p1 = eyePoints[0],
        p2 = eyePoints[1],
        p3 = eyePoints[2],
        p4 = eyePoints[3],
        p5 = eyePoints[4],
        p6 = eyePoints[5];

      const d1 = dist(p2, p6);
      const d2 = dist(p3, p5);
      const dHorizontal = dist(p1, p4);

      if (dHorizontal === 0) return 0;
      return (d1 + d2) / (2.0 * dHorizontal);
    };

    try {
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // Log để bạn kiểm tra trong Console (F12)
      // Nếu log này ra [0, 0] nghĩa là camera/landmark chưa bắt được điểm mắt
      console.log("Toạ độ mắt trái điểm đầu:", leftEye[0].x, leftEye[0].y);

      const leftEAR = getEyeEAR(leftEye);
      const rightEAR = getEyeEAR(rightEye);

      return (leftEAR + rightEAR) / 2.0;
    } catch (e) {
      console.error("Lỗi khi tính EAR:", e);
      return 0;
    }
  };

  const handleAction = async (type) => {
    if (!modelsLoaded) {
      toast.error("AI chưa tải xong!");
      return;
    }

    setIsVerifying(true); // Đánh dấu đang xác thực
    console.log("--- BẮT ĐẦU XÁC THỰC LIVENESS ---");

    if (enableLiveness) {
      setLivenessState("WAITING");
      setLivenessMsg("Vui lòng chớp mắt để xác thực");
      blinkState.current = "WAITING";
      blinkFramesCount.current = 0;

      // Định nghĩa hàm loop
      const detectLoop = async () => {
        // Xóa điều kiện if (!isVerifying) return tạm thời để debug

        const detections = await faceapi
          .detectSingleFace(videoRef.current)
          .withFaceLandmarks();

        if (detections) {
          const avgEAR = calculateEAR(detections.landmarks);
          console.log("EAR đo được:", avgEAR); // LOG NÀY PHẢI HIỆN RA
          setCurrentEAR(avgEAR.toFixed(3));

          // Logic chuyển state (giữ nguyên của bạn)
          if (blinkState.current === "WAITING") {
            if (avgEAR < EAR_THRESHOLD_DOWN) {
              blinkFramesCount.current++;
              if (blinkFramesCount.current >= CONFIDENCE_FRAMES) {
                blinkState.current = "DOWN";
                setLivenessState("DOWN");
                console.log("Chuyển sang trạng thái: ĐÃ NHẮM MẮT");
              }
            }
          } else if (blinkState.current === "DOWN") {
            if (avgEAR > EAR_THRESHOLD_UP) {
              blinkState.current = "SUCCESS";
              setLivenessState("SUCCESS");
              setLivenessMsg("Chớp mắt thành công!");
              console.log("--- CHỚP MẮT THÀNH CÔNG ---");

              // Đợi 300ms để người dùng mở mắt hẳn trước khi lấy descriptor
              setTimeout(async () => {
                const finalDetection = await faceapi
                  .detectSingleFace(videoRef.current)
                  .withFaceLandmarks()
                  .withFaceDescriptor();

                if (finalDetection) {
                  performBackendCheck(type, finalDetection.descriptor);
                } else {
                  toast.error(
                    "Không thể lấy dữ liệu khuôn mặt sau khi chớp mắt.",
                  );
                  resetLiveness();
                }
              }, 300);
              return;
            }
          }
          requestAnimationFrame(detectLoop);
        } else {
          console.log("Đang tìm mặt...");
          requestAnimationFrame(detectLoop);
        }
      };

      detectLoop(); // Gọi hàm loop
    } else {
      // Khi không bật liveness
      const detections = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        performBackendCheck(type, detections.descriptor);
      } else {
        toast.warn("Không tìm thấy khuôn mặt. Vui lòng nhìn thẳng vào camera.");
        setIsVerifying(false);
      }
    }
  };

  const resetLiveness = () => {
    setIsVerifying(false);
    setLivenessState(null);
    setLivenessMsg("");
  };

  const performBackendCheck = (type, descriptor) => {
    const faceVector = Array.from(descriptor);

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
      .finally(() => resetLiveness());
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h2>Điểm danh khuôn mặt</h2>
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay muted />
          {loading && <div className="overlay">Đang khởi động camera...</div>}
          {isVerifying && !livenessState && (
            <div className="scanning-bar"></div>
          )}
          {livenessState && (
            <div className={`liveness-prompt ${livenessState.toLowerCase()}`}>
              <div className="debug-info">
                <span>EAR: {currentEAR}</span>
                <span> | State: {livenessState}</span>
              </div>
              <div className="liveness-msg">{livenessMsg}</div>
              <div className="liveness-indicator">
                {livenessState === "WAITING" && "👁️‍🗨️ Đang chờ chớp mắt..."}
                {livenessState === "DOWN" && "✔️ Đã nhắm mắt"}
                {livenessState === "SUCCESS" && "✅ Thành công!"}
              </div>
            </div>
          )}
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
