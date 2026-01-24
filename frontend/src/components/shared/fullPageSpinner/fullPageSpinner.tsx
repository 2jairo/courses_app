import { Spinner } from "@/components/ui/spinner"

export const FullPageSpinner = () => {
  return (
    <div className="flex-1 flex justify-center items-center">
      <Spinner />
    </div>
  )
}

export const WFullSpinner = ({ className }: { className: string }) => {
  return (
    <div className="w-full flex justify-center items-center">
      <Spinner className={className}/>
    </div>
  )
}
