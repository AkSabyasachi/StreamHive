// src/components/common/ConfirmDialog.jsx
import React from "react";
import Modal from "./Modal";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="text-center space-y-6 p-6"
      >
        <div className="flex justify-center text-yellow-500">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-neutral-700 text-gray-300 hover:bg-neutral-800 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ConfirmDialog;