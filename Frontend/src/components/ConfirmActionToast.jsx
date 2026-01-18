const ConfirmActionToast = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-red-600",
  onConfirm,
  closeToast,
}) => {
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <p className="text-sm text-gray-500 mb-3">{message}</p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            closeToast()
            onConfirm()
          }}
          className={`px-3 py-1 text-white rounded ${confirmColor}`}
        >
          {confirmText}
        </button>

        <button
          onClick={closeToast}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          {cancelText}
        </button>
      </div>
    </div>
  )
}

export default ConfirmActionToast;