import type { CollectionConfig } from 'payload'

export const Addons: CollectionConfig = {
  slug: 'cms-addons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'priceInCents', 'additionalMinutes', 'isActive'],
    group: 'Content',
  },
  labels: {
    singular: 'Add-on',
    plural: 'Add-ons',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'priceInCents',
      type: 'number',
      required: true,
      admin: {
        description: 'Price in cents (e.g., 2500 = $25)',
      },
    },
    {
      name: 'additionalMinutes',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Extra minutes added to the session',
      },
    },
    {
      name: 'compatibleServices',
      type: 'relationship',
      relationTo: 'cms-services',
      hasMany: true,
      admin: {
        description: 'Services this add-on is available for',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
