import toast from "react-hot-toast";

export function ToastError(message: string) {
    return toast.error(message, {
    icon: '❌',
    style: {
      borderRadius: '6px',
      background: 'var(--card)',
      padding: '10px',
      border: '1px solid var(--border)',
      color: 'var(--text)',
    },
  })
}