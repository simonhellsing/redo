import { PageHeader } from '@/components/ui/PageHeader'
import { Divider } from '@/components/ui/Divider'
import { getUserWorkspace } from '@/lib/auth/getUserWorkspace'
import { redirect } from 'next/navigation'
import { BrandingSettingsForm } from '@/components/admin/BrandingSettingsForm'
import { MdOutlineSettings } from 'react-icons/md'

export default async function BrandingSettingsPage() {
  const workspace = await getUserWorkspace()
  
  if (!workspace) {
    redirect('/overview')
  }

  const settingsIcon = (
    <div className="flex items-center justify-center w-full h-full" style={{ color: 'var(--neutral-500)' }}>
      <MdOutlineSettings style={{ width: '20px', height: '20px' }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <PageHeader
        logo={settingsIcon}
        title="Inställningar"
      />
      
      <Divider />
      
      <div className="flex flex-col gap-[40px] items-center justify-center pb-[80px] pt-[20px] px-[8%] rounded-[12px] w-full min-h-[400px]">
        <BrandingSettingsForm workspace={workspace} />
      </div>
    </div>
  )
}

