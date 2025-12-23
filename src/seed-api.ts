// Seed script using the Payload REST API
// Run this after the CMS is deployed and you have an admin account

const CMS_URL = process.env.PAYLOAD_CMS_URL || 'https://payload-ftw-cms.vercel.app'

interface AuthResponse {
  token: string
  user: { id: number; email: string }
}

async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${CMS_URL}/api/admins/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`)
  }

  const data = (await response.json()) as AuthResponse
  return data.token
}

async function createItem(collection: string, data: Record<string, unknown>, token: string) {
  const response = await fetch(`${CMS_URL}/api/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create ${collection}: ${error}`)
  }

  return response.json()
}

async function seed() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables')
    process.exit(1)
  }

  console.log('🌱 Seeding Payload CMS via API...')
  console.log(`Using CMS at: ${CMS_URL}`)

  // Login
  console.log('Logging in...')
  const token = await login(email, password)
  console.log('✓ Logged in')

  // Seed Services
  console.log('Seeding services...')
  const servicesData = [
    {
      name: 'Swedish Massage',
      slug: 'swedish-massage',
      description:
        'A classic relaxation massage using long, flowing strokes to ease tension and promote overall well-being. Perfect for first-timers or those seeking pure relaxation.',
      category: 'modern_massage',
      duration: 60,
      price: 10000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Deep Tissue Massage',
      slug: 'deep-tissue-massage',
      description:
        'Targeted pressure on deeper muscle layers to release chronic tension and knots. Ideal for those with persistent muscle pain or recovery needs.',
      category: 'modern_massage',
      duration: 60,
      price: 12000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Hot Stone Massage',
      slug: 'hot-stone-massage',
      description:
        'Heated basalt stones melt away tension while promoting deep relaxation. The warmth penetrates muscles for enhanced therapeutic benefits.',
      category: 'modern_massage',
      duration: 90,
      price: 15000,
      creditValue: 2,
      isActive: true,
    },
    {
      name: 'Craniosacral Therapy',
      slug: 'craniosacral-therapy',
      description:
        'Gentle touch to release restrictions in the craniosacral system. Helps with headaches, TMJ, stress, and nervous system regulation.',
      category: 'holistic_bodywork',
      duration: 60,
      price: 13000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Myofascial Release',
      slug: 'myofascial-release',
      description:
        'Sustained pressure to release fascial restrictions and restore mobility. Effective for chronic pain, postural issues, and movement limitations.',
      category: 'holistic_bodywork',
      duration: 75,
      price: 14000,
      creditValue: 2,
      isActive: true,
    },
    {
      name: 'Lymphatic Drainage',
      slug: 'lymphatic-drainage',
      description:
        'Light, rhythmic strokes to stimulate lymph flow and reduce swelling. Supports immune function and post-surgical recovery.',
      category: 'holistic_bodywork',
      duration: 60,
      price: 12000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Sports Massage',
      slug: 'sports-massage',
      description:
        'Performance-focused massage for athletes. Enhances recovery, prevents injury, and improves flexibility and range of motion.',
      category: 'athletic_recovery',
      duration: 60,
      price: 12000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Percussion Therapy',
      slug: 'percussion-therapy',
      description:
        'Targeted percussion device treatment for rapid muscle recovery. Breaks up lactic acid and increases blood flow to treated areas.',
      category: 'athletic_recovery',
      duration: 30,
      price: 6000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Stretch Therapy',
      slug: 'stretch-therapy',
      description:
        'Assisted stretching session to improve flexibility and range of motion. Great for desk workers and athletes alike.',
      category: 'athletic_recovery',
      duration: 45,
      price: 8000,
      creditValue: 1,
      isActive: true,
    },
  ]

  const insertedServices: Record<string, number> = {}
  for (const service of servicesData) {
    try {
      const result = await createItem('cms-services', service, token)
      insertedServices[service.slug] = result.doc.id
      console.log(`  ✓ Created service: ${service.name}`)
    } catch (e) {
      console.log(`  ⚠ Skipped service: ${service.name} (may already exist)`)
    }
  }

  // Seed Packages
  console.log('Seeding packages...')
  const packagesData = [
    {
      name: 'Wellness 5-Pack',
      slug: 'wellness-5-pack',
      description: 'Five credits to use on any service. Perfect for regular self-care. Save $50!',
      type: 'credit',
      priceInCents: 45000,
      creditAmount: 5,
      validDays: 365,
      isActive: true,
    },
    {
      name: 'Recovery 10-Pack',
      slug: 'recovery-10-pack',
      description:
        'Ten credits for the dedicated wellness enthusiast. Maximum flexibility, maximum savings. Save $150!',
      type: 'credit',
      priceInCents: 85000,
      creditAmount: 10,
      validDays: 365,
      isActive: true,
    },
    {
      name: 'Deep Tissue 3-Pack',
      slug: 'deep-tissue-3-pack',
      description:
        'Three 60-minute Deep Tissue sessions. Ideal for ongoing muscle maintenance. Save $30!',
      type: 'specific',
      priceInCents: 33000,
      relatedService: insertedServices['deep-tissue-massage'],
      sessionCount: 3,
      validDays: 180,
      isActive: true,
    },
    {
      name: 'Monthly Wellness',
      slug: 'monthly-wellness',
      description: 'Two 60-minute Swedish Massage sessions. Your monthly reset routine. Save $20!',
      type: 'specific',
      priceInCents: 18000,
      relatedService: insertedServices['swedish-massage'],
      sessionCount: 2,
      validDays: 60,
      isActive: true,
    },
  ]

  for (const pkg of packagesData) {
    try {
      await createItem('cms-packages', pkg, token)
      console.log(`  ✓ Created package: ${pkg.name}`)
    } catch (e) {
      console.log(`  ⚠ Skipped package: ${pkg.name} (may already exist)`)
    }
  }

  // Seed Add-ons
  console.log('Seeding add-ons...')
  const allServiceIds = Object.values(insertedServices)
  const addonsData = [
    {
      name: 'Hot Stones Enhancement',
      slug: 'hot-stones-enhancement',
      description: 'Add heated basalt stones to any massage for deeper muscle relaxation.',
      priceInCents: 2500,
      additionalMinutes: 15,
      compatibleServices: allServiceIds,
      isActive: true,
    },
    {
      name: 'Cupping Therapy',
      slug: 'cupping-therapy',
      description:
        'Silicone cups create suction to release muscle tension and increase circulation.',
      priceInCents: 2000,
      additionalMinutes: 15,
      compatibleServices: allServiceIds,
      isActive: true,
    },
    {
      name: 'Aromatherapy',
      slug: 'aromatherapy',
      description:
        'Premium essential oils customized to your needs - relaxation, energizing, or therapeutic.',
      priceInCents: 1500,
      additionalMinutes: 0,
      compatibleServices: allServiceIds,
      isActive: true,
    },
    {
      name: 'CBD Oil Upgrade',
      slug: 'cbd-oil-upgrade',
      description: 'Premium CBD-infused massage oil for enhanced pain relief and relaxation.',
      priceInCents: 2000,
      additionalMinutes: 0,
      compatibleServices: allServiceIds,
      isActive: true,
    },
    {
      name: 'Extended Session',
      slug: 'extended-session',
      description: 'Add extra time to focus on problem areas or simply extend your relaxation.',
      priceInCents: 4000,
      additionalMinutes: 30,
      compatibleServices: allServiceIds,
      isActive: true,
    },
  ]

  for (const addon of addonsData) {
    try {
      await createItem('cms-addons', addon, token)
      console.log(`  ✓ Created add-on: ${addon.name}`)
    } catch (e) {
      console.log(`  ⚠ Skipped add-on: ${addon.name} (may already exist)`)
    }
  }

  // Seed Blog Posts
  console.log('Seeding blog posts...')
  const blogPostsData = [
    {
      title: '5 Benefits of Regular Massage Therapy',
      slug: '5-benefits-regular-massage-therapy',
      excerpt:
        'Discover how incorporating regular massage therapy into your wellness routine can transform your physical and mental health.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: "Regular massage therapy is more than just a luxury—it's a powerful tool for maintaining your overall health and well-being. Here are five key benefits you can expect from making massage a regular part of your self-care routine.",
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '1. Reduced Muscle Tension and Pain' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: "One of the most immediate benefits of massage therapy is relief from muscle tension and pain. Whether you're dealing with chronic back pain, tension headaches, or sports-related soreness, targeted massage techniques can help release tight muscles and improve blood flow to affected areas.",
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '2. Lower Stress and Anxiety' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Massage therapy triggers the release of endorphins—your body\'s natural "feel-good" chemicals. It also reduces cortisol levels, the hormone associated with stress. Regular sessions can help you maintain a calmer, more balanced mental state.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      category: 'wellness',
      author: 'Free The Wellness',
      status: 'published',
      publishedAt: '2024-12-01T00:00:00.000Z',
      tags: [{ tag: 'massage' }, { tag: 'wellness' }, { tag: 'health' }],
    },
    {
      title: 'Understanding Different Massage Techniques',
      slug: 'understanding-massage-techniques',
      excerpt:
        'From Swedish to Deep Tissue, learn which massage technique is right for your needs.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: "Choosing the right massage technique can make all the difference in your experience and results. Here's a guide to help you understand the most popular options.",
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Swedish Massage' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'The most common type of massage, Swedish massage uses long, flowing strokes to promote relaxation and improve circulation. Perfect for first-time massage clients and general relaxation.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      category: 'education',
      author: 'Free The Wellness',
      status: 'published',
      publishedAt: '2024-11-15T00:00:00.000Z',
      tags: [{ tag: 'massage techniques' }, { tag: 'education' }],
    },
  ]

  for (const post of blogPostsData) {
    try {
      await createItem('cms-posts', post, token)
      console.log(`  ✓ Created blog post: ${post.title}`)
    } catch (e) {
      console.log(`  ⚠ Skipped blog post: ${post.title} (may already exist)`)
    }
  }

  console.log('✅ Seeding complete!')
}

seed().catch((e) => {
  console.error('Seeding failed:', e)
  process.exit(1)
})
