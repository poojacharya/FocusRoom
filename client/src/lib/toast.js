import toast, { Toaster } from 'react-hot-toast'

export { Toaster }

const baseOptions = {
  duration: 4000,
  style: {
    borderRadius: '12px',
    fontSize: '14px',
    padding: '10px 14px',
  },
}

export function showSuccessToast(message) {
  toast.success(message, baseOptions)
}

export function showErrorToast(message) {
  toast.error(message, baseOptions)
}
