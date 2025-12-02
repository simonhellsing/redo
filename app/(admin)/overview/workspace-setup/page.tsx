import { CreateWorkspaceForm } from '@/components/admin/CreateWorkspaceForm'

export default function WorkspaceSetupPage() {
  return (
    <div className="bg-[var(--neutral-0)] box-border flex items-center justify-between overflow-clip p-2 h-screen w-full">
      <div className="basis-0 flex flex-col grow h-full items-start min-h-px min-w-px relative shrink-0">
        <div className="basis-0 flex gap-[10px] grow items-center justify-center min-h-px min-w-px relative shrink-0 w-full">
          <div className="box-border flex flex-col gap-[20px] items-center px-5 py-10 relative shrink-0 w-[400px]">
            <CreateWorkspaceForm />
          </div>
        </div>
      </div>
      <div className="h-full relative rounded-[12px] shrink-0 w-[400px] overflow-hidden">
        <img 
          alt="" 
          className="absolute inset-0 max-w-none object-cover object-center pointer-events-none rounded-[12px] size-full" 
          src="https://zcqixoxpdeqecqhafxsy.supabase.co/storage/v1/object/public/general/splash.jpg"
        />
      </div>
    </div>
  )
}

