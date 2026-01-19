import { toast } from "react-toastify"
import ConfirmActionToast from "../components/ConfirmActionToast.jsx"

export const showConfirmToast = ({
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "bg-red-600",
  onConfirm,
}) => {
  toast(
    ({ closeToast }) => (
      <ConfirmActionToast
        title={title}
        message={message}
        confirmText={confirmText}
        confirmColor={confirmColor}
        closeToast={closeToast}
        onConfirm={onConfirm}
      />
    ),
    { autoClose: false }
  )
}
