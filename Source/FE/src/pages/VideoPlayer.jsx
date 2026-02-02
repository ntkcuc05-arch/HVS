import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Link,
  FileVideo,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { systemConfig } from "../constants/systems";
import "./VideoPlayer.css";

// Video data for each system
const getVideoData = (systemId, videoType) => {
  const systemName = systemConfig[systemId]?.name || systemId;

  if (videoType === "link") {
    // Custom links based on system
    let customLink = "https://kios-dev.huongvietsinh.com/login";

    // You can add specific links for other systems here if needed

    return {
      title: `${systemName} - Video hướng dẫn Online`,
      url: customLink,
      summary: ` TỔNG KẾT NỘI DUNG VIDEO

Mục tiêu:
Hướng dẫn người dùng sử dụng ${systemName} một cách hiệu quả.

Nội dung chính:

1. Giới thiệu tổng quan
  • Tổng quan về ${systemName}
  • Vai trò trong hệ sinh thái HVS
  • Các tính năng nổi bật

2. Hướng dẫn đăng nhập
  • Cách truy cập hệ thống
  • Đăng nhập với tài khoản được cấp
  • Khôi phục mật khẩu

3. Giao diện chính
  • Dashboard và các menu
  • Tùy chỉnh hiển thị
  • Phím tắt thường dùng

4. Các chức năng cơ bản
  • Thao tác CRUD dữ liệu
  • Tìm kiếm và lọc
  • Xuất báo cáo

5. Mẹo sử dụng
  • Tối ưu hiệu suất làm việc
  • Xử lý lỗi thường gặp
  • Liên hệ hỗ trợ kỹ thuật`,
      duration: "15:30",
    };
  } else {
    return {
      title: `${systemName} - Video hướng dẫn Offline`,
      url: "https://www.youtube.com/watch?v=N4KSCjEtnu0",
      summary: `📌 TỔNG KẾT NỘI DUNG VIDEO

Mục tiêu:
Demo chi tiết và hướng dẫn nâng cao cho ${systemName}.

Nội dung chính:

1. Demo thực tế
  • Walkthrough đầy đủ các màn hình
  • Thao tác mẫu từng chức năng
  • Các tình huống sử dụng thực tế

2. Cấu hình nâng cao
  • Thiết lập tham số hệ thống
  • Tùy chỉnh workflow
  • Tích hợp với hệ thống khác

3. Quản trị hệ thống
  • Phân quyền người dùng
  • Quản lý nhóm và vai trò
  • Audit log và bảo mật

4. Báo cáo & Thống kê
  • Các loại báo cáo có sẵn
  • Tùy chỉnh báo cáo
  • Lập lịch báo cáo tự động

5. Troubleshooting
  • Các lỗi thường gặp
  • Cách khắc phục nhanh
  • Khi nào cần hỗ trợ IT`,
      duration: "22:45",
    };
  }
};

function VideoPlayer() {
  const navigate = useNavigate();
  const { systemId } = useParams();
  const [searchParams] = useSearchParams();
  const videoType = searchParams.get("type") || "link";

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const config = systemConfig[systemId] || systemConfig["hvs-umea"];
  const videoData = getVideoData(systemId, videoType);
  const IconComponent = config.icon;

  // Video Controls
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleProgressClick = (e) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  const toggleLoop = () => {
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    if (videoRef.current) {
      videoRef.current.loop = newLoopState;
    }
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div
      className="video-player-page"
      style={{
        "--player-color": config.color,
        "--player-glow": config.glowColor,
      }}
    >
      {/* Background */}
      <div className="video-player-bg">
        <div className="bg-gradient"></div>
        <div className="bg-noise"></div>
      </div>

      {/* Header */}
      <motion.header
        className="video-player-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          className="back-button"
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>

        <div className="header-title">
          <div className="header-icon" style={{ background: config.color }}>
            <IconComponent size={22} />
          </div>
          <div className="header-text">
            <h1>{config.name}</h1>
            <span>
              {videoType === "link" ? (
                <>
                  <Link size={14} /> Video Online
                </>
              ) : (
                <>
                  <FileVideo size={14} /> Video Offline
                </>
              )}
            </span>
          </div>
        </div>

        <div className="header-spacer"></div>
      </motion.header>

      {/* Main Content */}
      <main className="video-player-main">
        {/* Left: Video Area */}
        <motion.div
          className="video-area"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="video-container">
            {videoType === "link" ? (
              // YouTube/Link Video
              <div className="video-wrapper">
                <iframe
                  src={`${videoData.url}?loop=1&playlist=${videoData.url.split("/").pop()}`}
                  title={videoData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              // MP4 Video
              <>
                <div className="video-wrapper">
                  <video
                    ref={videoRef}
                    src={videoData.url}
                    loop={isLooping}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={() =>
                      setCurrentTime(videoRef.current?.currentTime || 0)
                    }
                    onLoadedMetadata={() =>
                      setDuration(videoRef.current?.duration || 0)
                    }
                  />
                </div>

                {/* Video Controls */}
                <div className="video-controls">
                  {/* Progress Bar */}
                  <div
                    className="progress-bar"
                    ref={progressRef}
                    onClick={handleProgressClick}
                  >
                    <div
                      className="progress-filled"
                      style={{
                        width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="controls-row">
                    <div className="controls-left">
                      <motion.button
                        className="ctrl-btn play-btn"
                        onClick={handlePlayPause}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                      </motion.button>

                      <motion.button
                        className="ctrl-btn"
                        onClick={handleMute}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isMuted ? (
                          <VolumeX size={18} />
                        ) : (
                          <Volume2 size={18} />
                        )}
                      </motion.button>

                      <span className="time-display">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="controls-right">
                      <motion.button
                        className="ctrl-btn"
                        onClick={handleFullscreen}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Maximize size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Video Title */}
          <div className="video-title-bar">
            <h2>{videoData.title}</h2>
            <span className="video-duration">{videoData.duration}</span>
          </div>
        </motion.div>

        {/* Right: Controls & Summary Panel */}
        <motion.div
          className="controls-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Loop Control */}
          <div className="panel-section">
            <h3>
              <RotateCcw size={18} />
              Chức năng lặp lại
            </h3>
            <div className="loop-control">
              <span>Tự động phát lại video khi kết thúc</span>
              <motion.button
                className={`loop-toggle ${isLooping ? "active" : ""}`}
                onClick={toggleLoop}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="toggle-track">
                  <div className="toggle-thumb"></div>
                </div>
                <span>{isLooping ? "Đang BẬT" : "Đang TẮT"}</span>
              </motion.button>
            </div>

            {videoType === "mp4" && (
              <motion.button
                className="replay-btn"
                onClick={handleReplay}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={18} />
                Phát lại từ đầu
              </motion.button>
            )}
          </div>

          {/* Summary Section */}
          <div className="panel-section summary-section">
            <h3>
              <BookOpen size={18} />
              Tổng kết nội dung
            </h3>
            <div className="summary-content">
              <pre>{videoData.summary}</pre>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel-section actions-section">
            <motion.button
              className="action-btn primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink size={18} />
              Truy cập {config.name}
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default VideoPlayer;
