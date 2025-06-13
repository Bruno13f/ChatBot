import toast from "react-hot-toast";

export async function ToastPromise(promise: Promise<any>, loading: string, success: string, error: string) {
    return await toast.promise(promise, {
      loading: loading,
      success: success,
      error: error,
  },{
    style: {
      borderRadius: '6px',
      background: 'var(--card)',
      padding: '10px',
      border: '1px solid var(--border)',
      color: 'var(--text)',
    },
  });
}