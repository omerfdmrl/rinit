import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data
    const message =
      data && typeof data === 'object' && 'error' in data
        ? String(data.error)
        : ''
    if (message.length > 0) {
      errMsg = message
    }
  }

  toast.error(errMsg)
}
