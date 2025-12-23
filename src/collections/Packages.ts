import type { CollectionConfig } from 'payload'

export const Packages: CollectionConfig = {
  slug: 'cms-packages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'priceInCents', 'isActive'],
    group: 'Content',
  },
  labels: {
    singular: 'Package',
    plural: 'Packages',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Credit Package', value: 'credit' },
        { label: 'Specific Service', value: 'specific' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'priceInCents',
      type: 'number',
      required: true,
      admin: {
        description: 'Price in cents (e.g., 45000 = $450)',
      },
    },
    // Credit package fields
    {
      name: 'creditAmount',
      type: 'number',
      admin: {
        description: 'Number of credits (for credit packages)',
        condition: (data) => data?.type === 'credit',
      },
    },
    // Specific package fields
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: 'cms-services',
      admin: {
        description: 'Service this package is for (for specific packages)',
        condition: (data) => data?.type === 'specific',
      },
    },
    {
      name: 'sessionCount',
      type: 'number',
      admin: {
        description: 'Number of sessions (for specific packages)',
        condition: (data) => data?.type === 'specific',
      },
    },
    {
      name: 'validDays',
      type: 'number',
      defaultValue: 365,
      admin: {
        description: 'How many days the package is valid',
        position: 'sidebar',
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
