import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Layers,
  X,
  Link as LinkIcon,
  FileVideo,
  Lock,
  Plus,
  Edit,
  Trash2,
  Upload,
  Apple,
} from "lucide-react";
import { api } from "../services/api";
import { systemConfig } from "../constants/systems";
import { useWeather } from "../hooks/useWeather";
import WeatherWidget from "../components/WeatherWidget";
import WeatherEffects from "../components/WeatherEffects";
import ConfirmModal from "../components/ConfirmModal";
import "./Home.css";

// =====================================================
// TREE NODE COMPONENT
// =====================================================
function TreeNode({ system, config, isEditMode, isDeleteMode, onEdit, onDelete, isActive, onToggle, onWatchVideo, zoomLevel = 1, onZoom, maxZoom = 2.5 }) {


  const handleChoiceClick = (e, type) => {
    if (e) e.stopPropagation();
    if (type === "link") {
      const url = system.appLink || systemConfig[system.id]?.appLink || "https://huongvietsinh.com";
      if (url) window.open(url, "_blank");
    } else if (type === "mp4") {
      const videoUrl = system.youtubeLink || systemConfig[system.id]?.youtubeLink || "https://www.youtube.com/watch?v=7dUuktZFAIE";
      if (videoUrl) onWatchVideo(videoUrl);
    }
  };

  const IconComponent = config?.icon || ExternalLink;
  const avatarUrl = system.avatarUrl ? api.getStaticUrl(system.avatarUrl) : config?.image;

  return (
    <motion.div
      className={`tree-node ${isEditMode ? 'edit-pulse' : ''} ${isDeleteMode ? 'delete-glow' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        "--node-color": config?.color || "#60A5FA",
        "--node-glow": config?.glowColor || "rgba(96, 165, 250, 0.5)"
      }}
    >
      <motion.div
        className="zoom-target-wrapper"
        animate={{ scale: zoomLevel }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="node-glow-ring"></div>
        <motion.div
          className="node-card"
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode) onEdit(system);
            else if (isDeleteMode) onDelete(system);
            else onToggle(system.id);
          }}

          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.98 }}
          style={{ cursor: isEditMode ? "grab" : (isDeleteMode ? "pointer" : "pointer") }}

        >
          <div className="node-icon">
            {avatarUrl ? (
              <img src={avatarUrl} alt={system.name} className="node-avatar" />
            ) : (
              <IconComponent size={24} strokeWidth={1.5} />
            )}
          </div>
          {isEditMode && <div className="edit-overlay"><Edit size={16} /></div>}
          {isDeleteMode && <div className="delete-overlay"><Trash2 size={16} /></div>}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {!isEditMode && !isDeleteMode && isActive && (
          <motion.div
            className="node-actions-direct"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              marginTop: 8 + 50 * (zoomLevel - 1),
            }}
          >
            <div className="direct-action-icons">
              <motion.button
                className="direct-action-btn link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChoiceClick(e, "link");
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title="Truy cập ứng dụng"
              >
                <LinkIcon size={16} />
              </motion.button>
              <motion.button
                className="direct-action-btn video-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChoiceClick(e, "mp4");
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                title="Xem hướng dẫn"
              >
                <FileVideo size={16} />
              </motion.button>
            </div>
            <div className="zoom-slider-container">
              <input
                type="range"
                min="0.5"
                max={maxZoom}
                step="0.1"
                value={zoomLevel}
                onChange={(e) => onZoom(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="zoom-slider"
                title={`Kích thước: ${Math.round(zoomLevel * 100)}%`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

function Home() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // 'add', 'edit', 'delete'
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);


  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [editingSystem, setEditingSystem] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
  });

  const [bgIndex, setBgIndex] = useState(1);
  const totalBackgrounds = 7;

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    appLink: "",
    youtubeLink: "",
    avatar: null,
    avatarPreview: null,
    hasBorder: false
  });

  const [envMode, setEnvMode] = useState('day'); // 'day', 'night'
  const [weatherMode, setWeatherMode] = useState('sunny'); // 'sunny', 'rain'
  const [nodeZooms, setNodeZooms] = useState(() => {
    const saved = localStorage.getItem('hvs_node_zooms');
    return saved ? JSON.parse(saved) : {};
  }); // {nodeID: zoomLevel }

  const weather = useWeather();
  const navigate = useNavigate();
  const logoRef = useRef(null);

  useEffect(() => {
    fetchSystems();
  }, []);

  useEffect(() => {
    const syncEnvironment = () => {
      const hour = new Date().getHours();
      // Luôn tuân thủ khung giờ 6h sáng - 6h tối cho chế độ Ngày/Đêm
      setEnvMode((hour >= 6 && hour < 18) ? 'day' : 'night');

      if (weather) {
        setWeatherMode(weather.code >= 51 ? 'rain' : 'sunny');
      }
    };

    syncEnvironment();
  }, [weather]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoRef.current && !logoRef.current.contains(event.target)) {
        setShowLogoMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex(prev => (prev % totalBackgrounds) + 1);
    }, 60000); // 30 seconds

    return () => clearInterval(bgInterval);
  }, []);

  useEffect(() => {
    // Preload next image to avoid flash during rotation
    const nextIndex = (bgIndex % totalBackgrounds) + 1;
    const img = new Image();
    img.src = `/back${nextIndex}.png`;
  }, [bgIndex]);

  const fetchSystems = async () => {
    const data = await api.getSystems();
    setSystems(data || []);
    setLoading(false);
  };

  const handleLogoClick = (e) => {
    e.stopPropagation();
    setShowLogoMenu(!showLogoMenu);
    setIsEditMode(false);
    setIsDeleteMode(false);
  };

  const handleMenuAction = (action) => {
    setPendingAction(action);
    setShowLogoMenu(false);
    setShowPasswordModal(true);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === "1234") {
      setShowPasswordModal(false);
      if (pendingAction === 'add') {
        setEditingSystem(null);
        setFormData({ id: "", name: "", appLink: "", youtubeLink: "", avatar: null, avatarPreview: null, hasBorder: false });
        setShowFormModal(true);
      } else if (pendingAction === 'edit') {
        setIsEditMode(true);
      } else if (pendingAction === 'delete') {
        setIsDeleteMode(true);
      }
    } else {
      setError("Mật khẩu không đúng!");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("app_link", formData.appLink);
    data.append("youtube_link", formData.youtubeLink);
    // Explicitly send "true"/"false" as string or use boolean
    data.append("has_border", formData.hasBorder ? "true" : "false");

    if (!formData.avatar && !editingSystem) {
      setError("Vui lòng tải ảnh đại diện!");
      return;
    }

    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }

    let result;
    if (editingSystem) {
      result = await api.updateSystem(editingSystem.id, data);
    } else {
      data.append("id", formData.id.toLowerCase().replace(/\s+/g, "-"));
      result = await api.createSystem(data);
    }

    if (result) {
      await fetchSystems();
      setShowFormModal(false);
      setEditingSystem(null);
      setFormData({ id: "", name: "", appLink: "", youtubeLink: "", avatar: null, avatarPreview: null });
    } else {
      setError("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleEditNode = (system) => {
    setEditingSystem(system);
    setFormData({
      id: system.id,
      name: system.name,
      appLink: system.appLink || "",
      youtubeLink: system.youtubeLink || "",
      avatar: null,
      avatarPreview: system.avatarUrl ? api.getStaticUrl(system.avatarUrl) : null,
      hasBorder: system.hasBorder || false
    });
    setShowFormModal(true);
    setIsEditMode(false);
  };

  const handleDeleteNode = (system) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa",
      message: `Bạn có chắc muốn xóa node "${system.name}"? Sau khi xóa, dữ liệu sẽ không thể khôi phục.`,
      onConfirm: async () => {
        const result = await api.deleteSystem(system.id);
        if (result) {
          await fetchSystems();
        }
        setIsDeleteMode(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };


  const handleDragEnd = async (e, info, system) => {
    const newX = (system.position?.x || 0) + info.offset.x;
    const newY = (system.position?.y || 0) + info.offset.y;

    const result = await api.updateSystemPosition(system.id, {
      x: newX,
      y: newY
    });

    if (result) {
      fetchSystems();
    }
  };

  const handleNodeZoom = (id, level) => {
    setNodeZooms(prev => {
      const next = { ...prev, [id]: level };
      localStorage.setItem('hvs_node_zooms', JSON.stringify(next));
      return next;
    });
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      const parts = url.split("/");
      const idWithParams = parts[parts.length - 1];
      videoId = idWithParams.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}` : url;
  };


  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-screen">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Layers size={48} className="loading-icon" />
          </motion.div>
          <p>Đang kết nối...</p>
        </div>
      </div>
    );
  }

  const gate = systems.find(s => s.id === "hvs-gate");
  const kiosLite = systems.find(s => s.id === "hvs-kios-lite");
  const umea = systems.find(s => s.id === "hvs-umea");
  const kios = systems.find(s => s.id === "hvs-kios");
  const food = systems.find(s => s.id === "hvs-food");

  const dynamicNodes = systems.filter(s =>
    !["hvs-gate", "hvs-kios-lite", "hvs-food", "hvs-kios", "hvs-umea"].includes(s.id)
  );

  const applePositions = [
    { top: "15%", left: "45%", size: 40, delay: 0 },
    { top: "20%", left: "55%", size: 35, delay: 0.5 },
    { top: "32%", left: "42%", size: 38, delay: 1.2 },
    { top: "38%", left: "58%", size: 42, delay: 0.8 },
    { top: "25%", left: "48%", size: 30, delay: 0.3 },
    { top: "42%", left: "52%", size: 38, delay: 1.5 },
  ];

  return (
    <div className={`home-container env-${envMode} env-${weatherMode}`} onClick={() => setActiveNodeId(null)}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={bgIndex}
          className="forest-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          style={{ backgroundImage: `url('/back${bgIndex}.png')` }}
        />
      </AnimatePresence>

      <WeatherEffects weatherMode={weatherMode} />

      {/* Decorative apples in the canopy */}
      <div className="tree-decoration-layer">
        {applePositions.map((pos, index) => (
          <motion.div
            key={`apple-${index}`}
            className="decorative-apple"
            style={{
              top: pos.top,
              left: pos.left,
              position: 'absolute'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + (index * 0.1) }}
          >
            <Apple size={pos.size} fill="currentColor" strokeWidth={1} />
          </motion.div>
        ))}
      </div>

      <motion.header className="header" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <div className="header-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }} ref={logoRef}>
          <div className="logo-wrapper">
            <img src="/logo.png" alt="logo" className="brand-icon-img" />
            <AnimatePresence>
              {showLogoMenu && (
                <motion.div
                  className="logo-admin-menu"
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                >
                  <button onClick={(e) => { e.stopPropagation(); handleMenuAction('add'); }}>
                    <Plus size={16} /> Thêm mới
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleMenuAction('edit'); }}>
                    <Edit size={16} /> Chỉnh sửa
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleMenuAction('delete'); }}>
                    <Trash2 size={16} /> Xóa node
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="brand-text">

          </div>
        </div>
        <WeatherWidget weather={weather} />
      </motion.header>

      {(isEditMode || isDeleteMode) && (
        <div className="admin-status-bar">
          <span>{isEditMode ? "Chế độ Chỉnh sửa: Chọn node để sửa" : "Chế độ Xóa: Chọn node để xóa"}</span>
          <button onClick={() => { setIsEditMode(false); setIsDeleteMode(false); }}>Thoát</button>
        </div>
      )}

      <main className="tree-main">
        <div className="tree-container" layout="true" layoutdependency={systems}>
          <div className="cards-layer">

            <div className="branch-row">
              {gate && (
                <motion.div
                  className={`branch-node left`}
                  layout
                  drag={isEditMode}
                  dragListener={isEditMode}
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(e, info, gate)}
                  initial={{ x: gate.position?.x || 0, y: gate.position?.y || 0 }}
                  animate={{ x: gate.position?.x || 0, y: gate.position?.y || 0 }}

                >
                  <TreeNode
                    system={gate}
                    config={systemConfig["hvs-gate"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                    isActive={activeNodeId === gate.id}
                    onToggle={(id) => setActiveNodeId(activeNodeId === id ? null : id)}
                    onWatchVideo={(url) => setSelectedVideoUrl(url)}
                    zoomLevel={nodeZooms[gate.id] || 1.0}
                    onZoom={(level) => handleNodeZoom(gate.id, level)}
                  />

                </motion.div>
              )}

              {kiosLite && (
                <motion.div
                  className={`branch-node right`}
                  layout
                  drag={isEditMode}
                  dragListener={isEditMode}
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(e, info, kiosLite)}
                  initial={{ x: kiosLite.position?.x || 0, y: kiosLite.position?.y || 0 }}
                  animate={{ x: kiosLite.position?.x || 0, y: kiosLite.position?.y || 0 }}

                >
                  <TreeNode
                    system={kiosLite}
                    config={systemConfig["hvs-kios-lite"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                    isActive={activeNodeId === kiosLite.id}
                    onToggle={(id) => setActiveNodeId(activeNodeId === id ? null : id)}
                    onWatchVideo={(url) => setSelectedVideoUrl(url)}
                    zoomLevel={nodeZooms[kiosLite.id] || 1.0}
                    onZoom={(level) => handleNodeZoom(kiosLite.id, level)}
                  />

                </motion.div>
              )}
            </div>

            <div className="trunk-column">
              {kios && (
                <motion.div
                  className={`trunk-node`}
                  layout
                  drag={isEditMode}
                  dragListener={isEditMode}
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(e, info, kios)}
                  initial={{ x: kios.position?.x || 0, y: kios.position?.y || 0 }}
                  animate={{ x: kios.position?.x || 0, y: kios.position?.y || 0 }}

                >
                  <TreeNode
                    system={kios}
                    config={systemConfig["hvs-kios"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                    isActive={activeNodeId === kios.id}
                    onToggle={(id) => setActiveNodeId(activeNodeId === id ? null : id)}
                    onWatchVideo={(url) => setSelectedVideoUrl(url)}
                    zoomLevel={nodeZooms[kios.id] || 1.0}
                    onZoom={(level) => handleNodeZoom(kios.id, level)}
                    maxZoom={1.4}
                  />

                </motion.div>
              )}

              {food && (
                <motion.div
                  className={`trunk-node`}
                  layout
                  drag={isEditMode}
                  dragListener={isEditMode}
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(e, info, food)}
                  initial={{ x: food.position?.x || 0, y: food.position?.y || 0 }}
                  animate={{ x: food.position?.x || 0, y: food.position?.y || 0 }}

                >
                  <TreeNode
                    system={food}
                    config={systemConfig["hvs-food"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                    isActive={activeNodeId === food.id}
                    onToggle={(id) => setActiveNodeId(activeNodeId === id ? null : id)}
                    onWatchVideo={(url) => setSelectedVideoUrl(url)}
                    zoomLevel={nodeZooms[food.id] || 1.0}
                    onZoom={(level) => handleNodeZoom(food.id, level)}
                    maxZoom={1.4}
                  />

                </motion.div>
              )}

              {umea && (
                <motion.div
                  className={`trunk-node root-node`}
                  layout
                  drag={isEditMode}
                  dragListener={isEditMode}
                  dragMomentum={false}
                  onDragEnd={(e, info) => handleDragEnd(e, info, umea)}
                  initial={{ x: umea.position?.x || 0, y: umea.position?.y || 0 }}
                  animate={{ x: umea.position?.x || 0, y: umea.position?.y || 0 }}

                >
                  <TreeNode
                    system={umea}
                    config={systemConfig["hvs-umea"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                    isActive={activeNodeId === umea.id}
                    onToggle={(id) => setActiveNodeId(activeNodeId === id ? null : id)}
                    onWatchVideo={(url) => setSelectedVideoUrl(url)}
                    zoomLevel={nodeZooms[umea.id] || 1.0}
                    onZoom={(level) => handleNodeZoom(umea.id, level)}
                    maxZoom={1.4}
                  />

                </motion.div>
              )}
            </div>

            {dynamicNodes.map(node => (
              <motion.div
                key={node.id}
                className={`dynamic-node ${node.hasBorder ? 'trunk-node' : ''}`}
                layout
                drag={isEditMode}
                dragListener={isEditMode}
                dragMomentum={false}
                onDragEnd={(e, info) => handleDragEnd(e, info, node)}
                initial={{ x: node.position?.x || 0, y: node.position?.y || 0 }}
                animate={{ x: node.position?.x || 0, y: node.position?.y || 0 }}
                style={{ position: 'absolute' }}

              >
                <TreeNode
                  system={node}
                  config={systemConfig[node.id] || { color: "#60A5FA", glowColor: "rgba(96, 165, 250, 0.5)" }}
                  isEditMode={isEditMode}
                  isDeleteMode={isDeleteMode}
                  onEdit={handleEditNode}
                  onDelete={handleDeleteNode}
                  isActive={activeNodeId === node.id}
                  onToggle={(id) => setActiveNodeId(activeNodeId === id ? null : id)}
                  onWatchVideo={(url) => setSelectedVideoUrl(url)}
                  zoomLevel={nodeZooms[node.id] || 1.0}
                  onZoom={(level) => handleNodeZoom(node.id, level)}
                />

              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <motion.footer className="footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p>Nhấn vào logo HVS để quản lý hệ thống</p>
      </motion.footer>

      <AnimatePresence>
        {showPasswordModal && (
          <div className="modal-overlay">
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="modal-header">
                <h3>Xác thực quyền</h3>
                <button onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="input-group">
                  <Lock size={18} />
                  <input type="password" placeholder="Nhập mã pin..." value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                </div>
                {error && <p className="error-text">{error}</p>}
                <button type="submit" className="submit-btn">Xác nhận</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFormModal && (
          <div className="modal-overlay">
            <motion.div className="modal-content data-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="modal-header">
                <h3>{editingSystem ? "Sửa Node" : "Thêm Node Mới"}</h3>
                <button onClick={() => setShowFormModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="avatar-upload-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div className={`preview-wrapper ${formData.hasBorder ? 'trunk-node' : ''}`} style={{ padding: '5px' }}>
                      <label className="avatar-dropzone node-card" style={{ width: '100px', height: '100px', margin: '0' }}>
                        {formData.avatarPreview ? (
                          <img src={formData.avatarPreview} alt="Preview" className="avatar-preview-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <div className="upload-placeholder">
                            <Upload size={32} />
                            <span>Ảnh</span>
                          </div>
                        )}
                        <input type="file" onChange={handleFileChange} accept="image/*" hidden />
                      </label>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Xem trước Node</span>
                  </div>

                  <div className="form-fields">
                    {!editingSystem && (
                      <div className="input-field">
                        <label>Mã Node (ID) <span style={{ color: '#f87171' }}>*</span></label>
                        <input type="text" placeholder="vd: hvs-new" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} required />
                      </div>
                    )}
                    <div className="input-field">
                      <label>Tên hiển thị <span style={{ color: '#f87171' }}>*</span></label>
                      <input type="text" placeholder="Tên hệ thống" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="input-field">
                      <label>Link ứng dụng <span style={{ color: '#f87171' }}>*</span></label>
                      <input type="url" placeholder="https://..." value={formData.appLink} onChange={(e) => setFormData({ ...formData, appLink: e.target.value })} required />
                    </div>
                    <div className="input-field">
                      <label>Link YouTube hướng dẫn <span style={{ color: '#f87171' }}>*</span></label>
                      <input type="url" placeholder="https://youtube.com/..." value={formData.youtubeLink} onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })} required />
                    </div>

                    <div className="form-group border-toggle-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px' }}>
                      <input
                        type="checkbox"
                        id="hasBorderToggle"
                        checked={formData.hasBorder}
                        onChange={(e) => setFormData({ ...formData, hasBorder: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                      <label htmlFor="hasBorderToggle" style={{ color: '#fff', fontSize: '15px', cursor: 'pointer', userSelect: 'none', fontWeight: '500' }}>
                        Sử dụng khung viền
                      </label>
                    </div>
                  </div>
                </div>
                <button type="submit" className="submit-btn create-btn">{editingSystem ? "Cập nhật" : "Tạo mới"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVideoUrl && (
          <div className="video-modal-overlay" onClick={() => setSelectedVideoUrl(null)}>
            <motion.div
              className="video-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="video-modal-close" onClick={() => setSelectedVideoUrl(null)}>
                <X size={24} />
              </button>
              <div className="video-iframe-container">
                <iframe
                  src={getEmbedUrl(selectedVideoUrl)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default Home;
