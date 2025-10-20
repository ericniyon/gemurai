import { useRouter } from "next/navigation"
import debounce from "lodash/debounce"

// Debounce time in milliseconds
const DEBOUNCE_TIME = 300

export const useNavigate = () => {
  const router = useRouter()

  const debouncedPush = debounce((path: string) => {
    router.push(path)
  }, DEBOUNCE_TIME)

  const debouncedReplace = debounce((path: string) => {
    router.replace(path)
  }, DEBOUNCE_TIME)

  return {
    push: debouncedPush,
    replace: debouncedReplace,
    back: () => router.back(),
    forward: () => router.forward(),
  }
}

// For programmatic navigation without hooks
export const createDebouncedNavigation = (router: any) => ({
  push: debounce((path: string) => router.push(path), DEBOUNCE_TIME),
  replace: debounce((path: string) => router.replace(path), DEBOUNCE_TIME),
  back: () => router.back(),
  forward: () => router.forward(),
}) 