import { Bars3Icon } from '@heroicons/react/24/outline'

const SidebarToggle = (...props: any) => {
  return (
    <div>
      <div className="flex items-center">
        <label
          htmlFor="my-drawer-2"
          className="btn btn-square drawer-button btn-ghost lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-7 w-7" aria-hidden="true" />
        </label>
      </div>
    </div>
  )
}

export default SidebarToggle
