import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Đồng ý",
    cancelText = "Hủy bỏ"
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="confirm-modal-overlay" onClick={onClose}>
                <motion.div
                    className="confirm-modal-content"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="confirm-modal-body">
                        <h2 className="confirm-modal-title">{title}</h2>
                        <p className="confirm-modal-message">{message}</p>
                    </div>

                    <div className="confirm-modal-footer">
                        <button className="confirm-btn cancel" onClick={onClose}>
                            {cancelText}
                        </button>
                        <button className="confirm-btn confirm" onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
