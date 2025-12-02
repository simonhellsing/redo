'use client'

import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Menu, MenuItem } from '@/components/ui/Menu'
import { GlobalNavigation } from '@/components/ui/GlobalNavigation'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { DataTableCell } from '@/components/ui/DataTableCell'
import { TableHeaderControl } from '@/components/ui/TableHeaderControl'
import { TableRow } from '@/components/ui/TableRow'
import { Table } from '@/components/ui/Table'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Illustration } from '@/components/ui/Illustration'
import { QuickAction } from '@/components/ui/QuickAction'
import { MdOutlineLanguage, MdOutlineChromeReaderMode, MdOutlineSettings, MdOutlineSearch, MdOutlineClose } from 'react-icons/md'

export default function ComponentLibraryPage() {
  return (
    <div className="min-h-screen bg-[var(--neutral-0)] p-[32px]">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-[40px]">
        {/* Header */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            00 Foundation
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Component Library
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        {/* Text Styles */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            00 Foundation
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Text Styles
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Headline
            </Text>
            <div className="flex flex-col gap-[8px]">
              <Text variant="headline-large" className="text-[var(--neutral-900)]">
                Headline Large
              </Text>
              <Text variant="headline-medium" className="text-[var(--neutral-900)]">
                Headline Medium
              </Text>
              <Text variant="headline-small" className="text-[var(--neutral-900)]">
                Headline Small
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Title
            </Text>
            <div className="flex flex-col gap-[8px]">
              <Text variant="title-large" className="text-[var(--neutral-900)]">
                Title Large
              </Text>
              <Text variant="title-medium" className="text-[var(--neutral-900)]">
                Title Medium
              </Text>
              <Text variant="title-small" className="text-[var(--neutral-900)]">
                Title Small
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Label
            </Text>
            <div className="flex flex-col gap-[8px]">
              <Text variant="label-large" className="text-[var(--neutral-900)]">
                Label Large
              </Text>
              <Text variant="label-medium" className="text-[var(--neutral-900)]">
                Label Medium
              </Text>
              <Text variant="label-small" className="text-[var(--neutral-900)]">
                Label Small
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Body
            </Text>
            <div className="flex flex-col gap-[8px]">
              <Text variant="body-large" className="text-[var(--neutral-900)]">
                Body Large
              </Text>
              <Text variant="body-medium" className="text-[var(--neutral-900)]">
                Body Medium
              </Text>
              <Text variant="body-small" className="text-[var(--neutral-900)]">
                Body Small
              </Text>
            </div>
          </div>
        </div>

        {/* Button Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Button
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Variants
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="navigation">Navigation</Button>
              <Button variant="tertiary">Tertiary</Button>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Sizes
            </Text>
            <div className="flex flex-wrap items-center gap-[12px]">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              With Icons
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <Button leftIcon={<MdOutlineSearch />}>Search</Button>
              <Button rightIcon={<MdOutlineClose />}>Close</Button>
              <Button leftIcon={<MdOutlineSearch />} rightIcon={<MdOutlineClose />}>
                Both Icons
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Disabled
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <Button disabled>Primary Disabled</Button>
              <Button variant="secondary" disabled>Secondary Disabled</Button>
              <Button variant="navigation" disabled>Navigation Disabled</Button>
              <Button variant="tertiary" disabled>Tertiary Disabled</Button>
            </div>
          </div>
        </div>

        {/* IconButton Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Icon Button
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Variants
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <IconButton variant="primary" aria-label="Primary" icon={<MdOutlineSearch />} />
              <IconButton variant="secondary" aria-label="Secondary" icon={<MdOutlineSearch />} />
              <IconButton variant="navigation" aria-label="Navigation" icon={<MdOutlineSearch />} />
              <IconButton variant="tertiary" aria-label="Tertiary" icon={<MdOutlineSearch />} />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Sizes
            </Text>
            <div className="flex flex-wrap items-center gap-[12px]">
              <IconButton size="small" aria-label="Small" icon={<MdOutlineSearch />} />
              <IconButton size="medium" aria-label="Medium" icon={<MdOutlineSearch />} />
              <IconButton size="large" aria-label="Large" icon={<MdOutlineSearch />} />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Disabled
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <IconButton variant="primary" disabled aria-label="Disabled" icon={<MdOutlineSearch />} />
              <IconButton variant="secondary" disabled aria-label="Disabled" icon={<MdOutlineSearch />} />
              <IconButton variant="navigation" disabled aria-label="Disabled" icon={<MdOutlineSearch />} />
              <IconButton variant="tertiary" disabled aria-label="Disabled" icon={<MdOutlineSearch />} />
            </div>
          </div>
        </div>

        {/* Input Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Input
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Variants
            </Text>
            <div className="flex flex-col gap-[12px] max-w-[400px]">
              <Input variant="primary" placeholder="Primary input" />
              <Input variant="secondary" placeholder="Secondary input" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Sizes
            </Text>
            <div className="flex flex-col gap-[12px] max-w-[400px]">
              <Input size="medium" placeholder="Medium input" />
              <Input size="large" placeholder="Large input" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              With Icons
            </Text>
            <div className="flex flex-col gap-[12px] max-w-[400px]">
              <Input leftIcon={<MdOutlineSearch />} placeholder="Search..." />
              <Input rightIcon={<MdOutlineClose />} placeholder="With right icon" />
              <Input leftIcon={<MdOutlineSearch />} rightIcon={<MdOutlineClose />} placeholder="Both icons" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Disabled
            </Text>
            <div className="flex flex-col gap-[12px] max-w-[400px]">
              <Input disabled placeholder="Disabled input" />
              <Input variant="secondary" disabled placeholder="Disabled secondary" />
            </div>
          </div>
        </div>

        {/* Menu Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Menu
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex items-start gap-[32px]">
            <div className="w-[200px]">
              <Menu>
                <MenuItem leftIcon={<MdOutlineSearch />}>Search</MenuItem>
                <MenuItem leftIcon={<MdOutlineSettings />}>Settings</MenuItem>
                <MenuItem leftIcon={<MdOutlineLanguage />}>Language</MenuItem>
                <MenuItem rightIcon={<MdOutlineClose />}>Close</MenuItem>
                <MenuItem leftIcon={<MdOutlineSearch />} rightIcon={<MdOutlineClose />}>
                  Both Icons
                </MenuItem>
                <MenuItem disabled>Disabled Item</MenuItem>
              </Menu>
            </div>
          </div>
        </div>

        {/* Global Navigation */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            02 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Global Navigation
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex items-start gap-[32px]">
            <div className="w-[216px]">
              <GlobalNavigation
                organizationName="Acme Redovi.."
                organizationLogo={
                  <div className="w-full h-full bg-[var(--neutral-200)] rounded-[8px]" />
                }
                navigationItems={[
                  {
                    label: 'Översikt',
                    icon: <MdOutlineLanguage />,
                    active: true,
                    onClick: () => console.log('Översikt clicked'),
                  },
                  {
                    label: 'Hjälp & dokumentation',
                    icon: <MdOutlineChromeReaderMode />,
                    onClick: () => console.log('Hjälp & dokumentation clicked'),
                  },
                  {
                    label: 'Inställningar',
                    icon: <MdOutlineSettings />,
                    onClick: () => console.log('Inställningar clicked'),
                  },
                ]}
                customers={[
                  {
                    name: 'Arbour Invest AB',
                    logo: (
                      <div className="w-full h-full bg-[var(--neutral-200)] rounded-[6px]" />
                    ),
                    onClick: () => console.log('Arbour Invest AB clicked'),
                  },
                  {
                    name: 'Customer 2',
                    logo: (
                      <div className="w-full h-full bg-[var(--neutral-200)] rounded-[6px]" />
                    ),
                    onClick: () => console.log('Customer 2 clicked'),
                  },
                  {
                    name: 'Customer 3',
                    onClick: () => console.log('Customer 3 clicked'),
                  },
                ]}
                onOrganizationClick={() => console.log('Organization clicked')}
                onNotificationClick={() => console.log('Notifications clicked')}
                onAddCustomerClick={() => console.log('Add customer clicked')}
              />
            </div>
          </div>
        </div>

        {/* Tag Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Tag
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Variants
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <Tag variant="default">Label</Tag>
              <Tag variant="prominent">Label</Tag>
              <Tag variant="attention">Label</Tag>
              <Tag variant="positive">Label</Tag>
              <Tag variant="negative">Label</Tag>
            </div>
          </div>
        </div>

        {/* Divider Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Divider
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Variants
            </Text>
            <div className="flex flex-col gap-[16px] w-full">
              <Divider variant="default" />
              <Divider variant="narrow" />
            </div>
          </div>
        </div>

        {/* DataTableCell Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Data Table Cell
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Hero Type
            </Text>
            <div className="flex flex-col gap-[8px]">
              <DataTableCell type="hero" state="default" label="Label" />
              <DataTableCell type="hero" state="hover" label="Label" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Default Type
            </Text>
            <div className="flex flex-col gap-[8px]">
              <DataTableCell type="default" state="default" label="Label" />
              <DataTableCell type="default" state="hover" label="Label" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Tag Type
            </Text>
            <div className="flex flex-col gap-[8px]">
              <DataTableCell type="tag" state="default" label="Label" />
              <DataTableCell type="tag" state="hover" label="Label" />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Actions Type
            </Text>
            <div className="flex flex-col gap-[8px]">
              <DataTableCell
                type="actions"
                state="default"
                onActionClick={() => console.log('Action clicked')}
              />
              <DataTableCell
                type="actions"
                state="hover"
                onActionClick={() => console.log('Action clicked')}
              />
            </div>
          </div>
        </div>

        {/* Table Header Control Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Table Header Control
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              States
            </Text>
            <div className="flex flex-wrap gap-[12px]">
              <TableHeaderControl label="Label" state="default" />
              <TableHeaderControl label="Label" state="active" />
              <TableHeaderControl label="Label" state="hover" />
            </div>
          </div>
        </div>

        {/* Table Row Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Table Row
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              States
            </Text>
            <div className="flex flex-col gap-[4px]">
              <TableRow
                state="default"
                heroLabel="Arbour Invest"
                defaultLabel="5005-4315"
                tag1Label="Ej uppladdad"
                tag2Label="Ej publicerad"
                onActionClick={() => console.log('Action clicked')}
              />
              <TableRow
                state="hover"
                heroLabel="Arbour Invest"
                defaultLabel="5005-4315"
                tag1Label="Ej uppladdad"
                tag2Label="Ej publicerad"
                onActionClick={() => console.log('Action clicked')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              With Different Tag Variants
            </Text>
            <div className="flex flex-col gap-[4px]">
              <TableRow
                state="default"
                heroLabel="Customer Name"
                defaultLabel="1234-5678"
                tag1Label="Status 1"
                tag2Label="Status 2"
                tag1Variant="positive"
                tag2Variant="attention"
                onActionClick={() => console.log('Action clicked')}
              />
            </div>
          </div>
        </div>

        {/* Table Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            02 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Table
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Complete Table with Pagination
            </Text>
            <div className="w-full">
              <Table
                columns={[
                  { label: 'Alla kunder', width: '300px', state: 'default' },
                  { label: 'Org. nummer', width: '120px', state: 'default' },
                  { label: 'Huvudbok', width: '120px', state: 'default' },
                  { label: 'Publicerad', width: '120px', state: 'default' },
                ]}
                rows={[
                  {
                    heroLabel: 'Arbour Invest',
                    defaultLabel: '5005-4315',
                    tag1Label: 'Ej uppladdad',
                    tag2Label: 'Ej publicerad',
                    actionLabel: 'Visa kund',
                    onActionClick: () => console.log('View customer clicked'),
                  },
                ]}
                currentPage={1}
                totalPages={3}
                onPageChange={(page) => console.log('Page changed to:', page)}
                onPreviousPage={() => console.log('Previous page')}
                onNextPage={() => console.log('Next page')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Table with Multiple Rows
            </Text>
            <div className="w-full">
              <Table
                columns={[
                  { label: 'Customer', width: '300px', state: 'active' },
                  { label: 'ID', width: '120px', state: 'default' },
                  { label: 'Status 1', width: '120px', state: 'default' },
                  { label: 'Status 2', width: '120px', state: 'default' },
                ]}
                rows={[
                  {
                    heroLabel: 'Customer A',
                    defaultLabel: '1234-5678',
                    tag1Label: 'Active',
                    tag2Label: 'Published',
                    tag1Variant: 'positive',
                    tag2Variant: 'positive',
                    actionLabel: 'View',
                    onActionClick: () => console.log('View Customer A'),
                  },
                  {
                    heroLabel: 'Customer B',
                    defaultLabel: '8765-4321',
                    tag1Label: 'Pending',
                    tag2Label: 'Draft',
                    tag1Variant: 'attention',
                    tag2Variant: 'default',
                    actionLabel: 'View',
                    onActionClick: () => console.log('View Customer B'),
                  },
                ]}
                currentPage={2}
                totalPages={3}
                onPageChange={(page) => console.log('Page changed to:', page)}
                onPreviousPage={() => console.log('Previous page')}
                onNextPage={() => console.log('Next page')}
              />
            </div>
          </div>
        </div>

        {/* Section Header Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Section Header
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Default
            </Text>
            <div className="w-full">
              <SectionHeader
                title="Alla kunder"
                onSearchClick={() => console.log('Search clicked')}
                onFilterClick={() => console.log('Filter clicked')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              With Custom Actions
            </Text>
            <div className="w-full">
              <SectionHeader
                title="Custom Section"
                actions={[
                  {
                    label: 'Add',
                    icon: <MdOutlineSearch />,
                    onClick: () => console.log('Add clicked'),
                  },
                  {
                    label: 'Export',
                    icon: <MdOutlineClose />,
                    onClick: () => console.log('Export clicked'),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Illustration Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Illustration
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Types
            </Text>
            <div className="flex flex-wrap gap-[16px] items-center">
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="binder" />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  Binder
                </Text>
              </div>
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="card" />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  Card
                </Text>
              </div>
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="calendar" />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  Calendar
                </Text>
              </div>
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="list" />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  List
                </Text>
              </div>
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="kit" />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  Kit
                </Text>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              Different Sizes
            </Text>
            <div className="flex flex-wrap gap-[16px] items-end">
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="binder" size={32} />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  32px
                </Text>
              </div>
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="binder" size={48} />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  48px
                </Text>
              </div>
              <div className="flex flex-col gap-[8px] items-center">
                <Illustration type="binder" size={64} />
                <Text variant="label-small" className="text-[var(--neutral-500)]">
                  64px
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* QuickAction Component */}
        <div className="flex flex-col gap-[20px]">
          <Text variant="body-medium" className="text-[var(--neutral-400)] tracking-[0.5px]">
            01 Components
          </Text>
          <Text variant="headline-large" className="text-[var(--neutral-900)]">
            Quick Action
          </Text>
        </div>

        <div className="h-px bg-[var(--neutral-200)] w-full" />

        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              States
            </Text>
            <div className="flex flex-wrap gap-[16px]">
              <QuickAction
                illustrationType="card"
                label="Label"
                state="default"
                onClick={() => console.log('QuickAction clicked')}
              />
              <QuickAction
                illustrationType="card"
                label="Label"
                state="hover"
                onClick={() => console.log('QuickAction clicked')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-[16px]">
            <Text variant="title-medium" className="text-[var(--neutral-900)]">
              With Different Illustrations
            </Text>
            <div className="flex flex-wrap gap-[16px]">
              <QuickAction
                illustrationType="binder"
                label="Binder"
                onClick={() => console.log('Binder clicked')}
              />
              <QuickAction
                illustrationType="calendar"
                label="Calendar"
                onClick={() => console.log('Calendar clicked')}
              />
              <QuickAction
                illustrationType="list"
                label="List"
                onClick={() => console.log('List clicked')}
              />
              <QuickAction
                illustrationType="kit"
                label="Kit"
                onClick={() => console.log('Kit clicked')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

