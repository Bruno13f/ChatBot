import toast from "react-hot-toast";

export function ToastSuccess(message: string) {
    return toast.success(message, {
    style: {
      borderRadius: '6px',
      background: 'var(--card)',
      padding: '10px',
      border: '1px solid var(--border)',
      color: 'var(--text)',
    },
  })
}