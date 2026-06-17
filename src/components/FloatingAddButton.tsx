import { useNavigate } from 'react-router-dom'
import { PlusIcon } from './icons'

/**
 * Floating "add loan" button. Pinned to the bottom-right of the viewport,
 * sitting just above the mobile bottom navigation so it never overlaps
 * scrollable content.
 */
export default function FloatingAddButton() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/laen/uus')}
      aria-label="Lisa laen"
      className="fixed bottom-[4.75rem] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform hover:bg-blue-500 active:scale-95 lg:bottom-8 lg:right-8 lg:h-14 lg:w-14"
    >
      <PlusIcon className="h-6 w-6" />
    </button>
  )
}
