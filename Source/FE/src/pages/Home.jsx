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
} from "lucide-react";
import { api } from "../services/api";
import { systemConfig } from "../constants/systems";
import { useWeather } from "../hooks/useWeather";
import WeatherWidget from "../components/WeatherWidget";
import "./Home.css";

// =====================================================
// TREE NODE COMPONENT
// =====================================================
function TreeNode({ system, config, popupPosition = "above", isEditMode, isDeleteMode, onEdit, onDelete }) {
  const [showChoices, setShowChoices] = useState(false);

  const handleNodeClick = (e) => {
    e.stopPropagation();
    if (isEditMode) {
      onEdit(system);
      return;
    }
    if (isDeleteMode) {
      onDelete(system);
      return;
    }
    setShowChoices(!showChoices);
  };

  const handleChoiceClick = (type) => {
    if (type === "link") {
      const url = system.appLink || (systemConfig[system.id]?.links?.[system.id]);
      if (url) window.open(url, "_blank");
    } else if (type === "mp4") {
      const videoUrl = system.youtubeLink || "https://www.youtube.com/watch?v=N4KSCjEtnu0";
      window.open(videoUrl, "_blank");
    }
  };

  const IconComponent = config?.icon || ExternalLink;
  const avatarUrl = system.avatarUrl ? api.getStaticUrl(system.avatarUrl) : config?.image;

  return (
    <motion.div
      className={`tree-node ${isEditMode ? 'edit-pulse' : ''} ${isDeleteMode ? 'delete-glow' : ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ "--node-color": config?.color || "#60A5FA", "--node-glow": config?.glowColor || "rgba(96, 165, 250, 0.5)" }}
    >
      <div className="node-glow-ring"></div>
      <motion.div
        className="node-card"
        onClick={handleNodeClick}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: isEditMode || isDeleteMode ? "pointer" : "grab" }}
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

      <AnimatePresence>
        {showChoices && !isEditMode && !isDeleteMode && (
          <>
            <motion.div
              className="choice-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChoices(false)}
            />
            <motion.div
              className={`video-choice-popup ${popupPosition}`}
              initial={{ opacity: 0, scale: 0.8, y: popupPosition === "below" ? -10 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: popupPosition === "below" ? -10 : 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="choice-header">
                <span>{system.name}</span>
                <button className="close-choice" onClick={() => setShowChoices(false)}>
                  <X size={14} />
                </button>
              </div>
              <div className="choice-options">
                <motion.button
                  className="choice-btn link-choice"
                  onClick={() => handleChoiceClick("link")}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="choice-icon"><LinkIcon size={20} /></div>
                  <div className="choice-info"><span className="choice-title">Truy cập ứng dụng</span></div>
                  <span className="choice-badge">LINK</span>
                </motion.button>
                <motion.button
                  className="choice-btn mp4-choice"
                  onClick={() => handleChoiceClick("mp4")}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="choice-icon"><FileVideo size={20} /></div>
                  <div className="choice-info"><span className="choice-title">Xem hướng dẫn</span></div>
                  <span className="choice-badge mp4">VIDEO</span>
                </motion.button>
              </div>
            </motion.div>
          </>
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
  const [pendingAction, setPendingAction] = useState(null); // 'add', 'edit', 'delete'
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [editingSystem, setEditingSystem] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    appLink: "",
    youtubeLink: "",
    avatar: null,
    avatarPreview: null
  });

  const weather = useWeather();
  const navigate = useNavigate();
  const logoRef = useRef(null);

  useEffect(() => {
    fetchSystems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoRef.current && !logoRef.current.contains(event.target)) {
        setShowLogoMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setFormData({ id: "", name: "", appLink: "", youtubeLink: "", avatar: null, avatarPreview: null });
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
      avatarPreview: system.avatarUrl ? api.getStaticUrl(system.avatarUrl) : null
    });
    setShowFormModal(true);
    setIsEditMode(false);
  };

  const handleDeleteNode = async (system) => {
    if (window.confirm(`Bạn có chắc muốn xóa node "${system.name}"?`)) {
      const result = await api.deleteSystem(system.id);
      if (result) {
        await fetchSystems();
      }
      setIsDeleteMode(false);
    }
  };

  const handleDragEnd = async (id, event, info) => {
    const system = systems.find(s => s.id === id);
    if (system) {
      // info.offset is total distance from start of drag
      const newPos = {
        x: (system.position?.x || 0) + info.offset.x,
        y: (system.position?.y || 0) + info.offset.y
      };

      // Optimistic update
      setSystems(prev => prev.map(s => s.id === id ? { ...s, position: newPos } : s));

      await api.updateSystemPosition(id, newPos);
    }
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

  return (
    <div className="home-container">
      <div className="forest-bg"></div>

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
            <h1>HVS</h1>
            <span>Hương Việt Sinh</span>
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
        <div className="tree-container">
          <div className="cards-layer">
            <div className="branch-row">
              {gate && (
                <motion.div
                  className="branch-node left"
                  layout
                  drag={!isEditMode && !isDeleteMode}
                  dragMomentum={false}
                  dragElastic={0.05}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{ scale: 1.02, zIndex: 100 }}
                  initial={false}
                  animate={{ x: gate.position?.x || 0, y: gate.position?.y || 0 }}
                  onDragEnd={(e, info) => handleDragEnd(gate.id, e, info)}
                >
                  <TreeNode
                    system={gate}
                    config={systemConfig["hvs-gate"]}
                    popupPosition="below"
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                  />
                </motion.div>
              )}

              {kiosLite && (
                <motion.div
                  className="branch-node right"
                  drag={!isEditMode && !isDeleteMode}
                  dragMomentum={true}
                  dragElastic={0}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{ scale: 1.02, zIndex: 100 }}
                  initial={false}
                  animate={{ x: kiosLite.position?.x || 0, y: kiosLite.position?.y || 0 }}
                  onDragEnd={(e, info) => handleDragEnd(kiosLite.id, e, info)}
                >
                  <TreeNode
                    system={kiosLite}
                    config={systemConfig["hvs-kios-lite"]}
                    popupPosition="below"
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                  />
                </motion.div>
              )}
            </div>

            <div className="trunk-column">
              {food && (
                <motion.div
                  className="branch-node left"
                  drag={!isEditMode && !isDeleteMode}
                  dragMomentum={true}
                  dragElastic={0}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{ scale: 1.05, zIndex: 1100 }}
                  initial={false}
                  animate={{ x: food.position?.x || 0, y: food.position?.y || 0 }}
                  onDragEnd={(e, info) => handleDragEnd(food.id, e, info)}
                >
                  <TreeNode
                    system={food}
                    config={systemConfig["hvs-food"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                  />
                </motion.div>
              )}

              {kios && (
                <motion.div
                  className="trunk-node"
                  layout
                  drag={!isEditMode && !isDeleteMode}
                  dragMomentum={false}
                  dragElastic={0.05}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{ scale: 1.02, zIndex: 100 }}
                  initial={false}
                  animate={{ x: kios.position?.x || 0, y: kios.position?.y || 0 }}
                  onDragEnd={(e, info) => handleDragEnd(kios.id, e, info)}
                >
                  <TreeNode
                    system={kios}
                    config={systemConfig["hvs-kios"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                  />
                </motion.div>
              )}

              {umea && (
                <motion.div
                  className="trunk-node root-node"
                  layout
                  drag={!isEditMode && !isDeleteMode}
                  dragMomentum={false}
                  dragElastic={0.05}
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  whileDrag={{ scale: 1.02, zIndex: 100 }}
                  initial={false}
                  animate={{ x: umea.position?.x || 0, y: umea.position?.y || 0 }}
                  onDragEnd={(e, info) => handleDragEnd(umea.id, e, info)}
                >
                  <TreeNode
                    system={umea}
                    config={systemConfig["hvs-umea"]}
                    isEditMode={isEditMode}
                    isDeleteMode={isDeleteMode}
                    onEdit={handleEditNode}
                    onDelete={handleDeleteNode}
                  />
                </motion.div>
              )}
            </div>

            {dynamicNodes.map(node => (
              <motion.div
                key={node.id}
                className="dynamic-node"
                drag={!isEditMode && !isDeleteMode}
                dragMomentum={true}
                dragElastic={0}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                whileDrag={{ scale: 1.02, zIndex: 100 }}
                initial={false}
                animate={{ x: node.position?.x || 0, y: node.position?.y || 0 }}
                onDragEnd={(e, info) => handleDragEnd(node.id, e, info)}
                style={{ position: 'absolute' }}
              >
                <TreeNode
                  system={node}
                  config={systemConfig[node.id] || { color: "#60A5FA", glowColor: "rgba(96, 165, 250, 0.5)" }}
                  isEditMode={isEditMode}
                  isDeleteMode={isDeleteMode}
                  onEdit={handleEditNode}
                  onDelete={handleDeleteNode}
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
                  <div className="avatar-upload-section">
                    <label className="avatar-dropzone">
                      {formData.avatarPreview ? (
                        <img src={formData.avatarPreview} alt="Preview" className="avatar-preview-img" />
                      ) : (
                        <div className="upload-placeholder">
                          <Upload size={32} />
                          <span>Tải ảnh đại diện</span>
                        </div>
                      )}
                      <input type="file" onChange={handleFileChange} accept="image/*" hidden />
                    </label>
                  </div>

                  <div className="form-fields">
                    {!editingSystem && (
                      <div className="input-field">
                        <label>Mã Node (ID)</label>
                        <input type="text" placeholder="vd: hvs-new" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} required />
                      </div>
                    )}
                    <div className="input-field">
                      <label>Tên hiển thị</label>
                      <input type="text" placeholder="Tên hệ thống" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="input-field">
                      <label>Link ứng dụng</label>
                      <input type="url" placeholder="https://..." value={formData.appLink} onChange={(e) => setFormData({ ...formData, appLink: e.target.value })} />
                    </div>
                    <div className="input-field">
                      <label>Link YouTube hướng dẫn</label>
                      <input type="url" placeholder="https://youtube.com/..." value={formData.youtubeLink} onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })} />
                    </div>
                  </div>
                </div>
                <button type="submit" className="submit-btn create-btn">{editingSystem ? "Cập nhật" : "Tạo mới"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
