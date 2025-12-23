import { config as dotenvConfig } from 'dotenv'
dotenvConfig({ path: '.env.local' })

import { getPayload } from 'payload'

async function seed() {
  console.log('🌱 Seeding Payload CMS...')

  // Dynamic import to ensure env vars are loaded first
  const { default: config } = await import('./payload.config')
  const payload = await getPayload({ config })

  // Seed Services
  console.log('Seeding services...')
  const servicesData = [
    // Modern Massage
    {
      name: 'Swedish Massage',
      slug: 'swedish-massage',
      description: 'A classic relaxation massage using long, flowing strokes to ease tension and promote overall well-being. Perfect for first-timers or those seeking pure relaxation.',
      category: 'modern_massage' as const,
      duration: 60,
      price: 10000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Deep Tissue Massage',
      slug: 'deep-tissue-massage',
      description: 'Targeted pressure on deeper muscle layers to release chronic tension and knots. Ideal for those with persistent muscle pain or recovery needs.',
      category: 'modern_massage' as const,
      duration: 60,
      price: 12000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Hot Stone Massage',
      slug: 'hot-stone-massage',
      description: 'Heated basalt stones melt away tension while promoting deep relaxation. The warmth penetrates muscles for enhanced therapeutic benefits.',
      category: 'modern_massage' as const,
      duration: 90,
      price: 15000,
      creditValue: 2,
      isActive: true,
    },
    // Holistic Bodywork
    {
      name: 'Craniosacral Therapy',
      slug: 'craniosacral-therapy',
      description: 'Gentle touch to release restrictions in the craniosacral system. Helps with headaches, TMJ, stress, and nervous system regulation.',
      category: 'holistic_bodywork' as const,
      duration: 60,
      price: 13000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Myofascial Release',
      slug: 'myofascial-release',
      description: 'Sustained pressure to release fascial restrictions and restore mobility. Effective for chronic pain, postural issues, and movement limitations.',
      category: 'holistic_bodywork' as const,
      duration: 75,
      price: 14000,
      creditValue: 2,
      isActive: true,
    },
    {
      name: 'Lymphatic Drainage',
      slug: 'lymphatic-drainage',
      description: 'Light, rhythmic strokes to stimulate lymph flow and reduce swelling. Supports immune function and post-surgical recovery.',
      category: 'holistic_bodywork' as const,
      duration: 60,
      price: 12000,
      creditValue: 1,
      isActive: true,
    },
    // Athletic Recovery
    {
      name: 'Sports Massage',
      slug: 'sports-massage',
      description: 'Performance-focused massage for athletes. Enhances recovery, prevents injury, and improves flexibility and range of motion.',
      category: 'athletic_recovery' as const,
      duration: 60,
      price: 12000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Percussion Therapy',
      slug: 'percussion-therapy',
      description: 'Targeted percussion device treatment for rapid muscle recovery. Breaks up lactic acid and increases blood flow to treated areas.',
      category: 'athletic_recovery' as const,
      duration: 30,
      price: 6000,
      creditValue: 1,
      isActive: true,
    },
    {
      name: 'Stretch Therapy',
      slug: 'stretch-therapy',
      description: 'Assisted stretching session to improve flexibility and range of motion. Great for desk workers and athletes alike.',
      category: 'athletic_recovery' as const,
      duration: 45,
      price: 8000,
      creditValue: 1,
      isActive: true,
    },
  ]

  const insertedServices: Record<string, number> = {}
  for (const service of servicesData) {
    const result = await payload.create({
      collection: 'cms-services',
      data: service,
    })
    insertedServices[service.slug] = result.id
    console.log(`  Created service: ${service.name}`)
  }

  // Seed Packages
  console.log('Seeding packages...')
  const packagesData = [
    // Credit packages
    {
      name: 'Wellness 5-Pack',
      slug: 'wellness-5-pack',
      description: 'Five credits to use on any service. Perfect for regular self-care. Save $50!',
      type: 'credit' as const,
      priceInCents: 45000,
      creditAmount: 5,
      validDays: 365,
      isActive: true,
    },
    {
      name: 'Recovery 10-Pack',
      slug: 'recovery-10-pack',
      description: 'Ten credits for the dedicated wellness enthusiast. Maximum flexibility, maximum savings. Save $150!',
      type: 'credit' as const,
      priceInCents: 85000,
      creditAmount: 10,
      validDays: 365,
      isActive: true,
    },
    // Specific packages
    {
      name: 'Deep Tissue 3-Pack',
      slug: 'deep-tissue-3-pack',
      description: 'Three 60-minute Deep Tissue sessions. Ideal for ongoing muscle maintenance. Save $30!',
      type: 'specific' as const,
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
      type: 'specific' as const,
      priceInCents: 18000,
      relatedService: insertedServices['swedish-massage'],
      sessionCount: 2,
      validDays: 60,
      isActive: true,
    },
  ]

  for (const pkg of packagesData) {
    await payload.create({
      collection: 'cms-packages',
      data: pkg,
    })
    console.log(`  Created package: ${pkg.name}`)
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
      description: 'Silicone cups create suction to release muscle tension and increase circulation.',
      priceInCents: 2000,
      additionalMinutes: 15,
      compatibleServices: allServiceIds,
      isActive: true,
    },
    {
      name: 'Aromatherapy',
      slug: 'aromatherapy',
      description: 'Premium essential oils customized to your needs - relaxation, energizing, or therapeutic.',
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
    await payload.create({
      collection: 'cms-addons',
      data: addon,
    })
    console.log(`  Created add-on: ${addon.name}`)
  }

  // Seed Blog Posts
  console.log('Seeding blog posts...')
  const blogPostsData = [
    {
      title: '5 Benefits of Regular Massage Therapy',
      slug: '5-benefits-regular-massage-therapy',
      excerpt: 'Discover how incorporating regular massage therapy into your wellness routine can transform your physical and mental health.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Regular massage therapy is more than just a luxury—it\'s a powerful tool for maintaining your overall health and well-being. Here are five key benefits you can expect from making massage a regular part of your self-care routine.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '1. Reduced Muscle Tension and Pain' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'One of the most immediate benefits of massage therapy is relief from muscle tension and pain. Whether you\'re dealing with chronic back pain, tension headaches, or sports-related soreness, targeted massage techniques can help release tight muscles and improve blood flow to affected areas.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '2. Lower Stress and Anxiety' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Massage therapy triggers the release of endorphins—your body\'s natural "feel-good" chemicals. It also reduces cortisol levels, the hormone associated with stress. Regular sessions can help you maintain a calmer, more balanced mental state.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '3. Improved Sleep Quality' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Many clients report better sleep after massage therapy. The relaxation response triggered during a session can help regulate your sleep patterns and improve the quality of your rest.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '4. Enhanced Immune Function' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Studies have shown that massage therapy can boost your immune system by increasing the activity of white blood cells. This means regular massages may help you stay healthier and recover faster from illness.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: '5. Better Posture and Flexibility' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Regular massage can help correct postural imbalances caused by sitting at a desk, driving, or repetitive movements. By releasing tight muscles and improving range of motion, massage therapy supports better overall body mechanics.' }],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      category: 'wellness' as const,
      author: 'Free The Wellness',
      status: 'published' as const,
      publishedAt: '2024-12-01T00:00:00.000Z',
      tags: [{ tag: 'massage' }, { tag: 'wellness' }, { tag: 'health' }, { tag: 'self-care' }],
    },
    {
      title: 'Understanding Different Massage Techniques',
      slug: 'understanding-massage-techniques',
      excerpt: 'From Swedish to Deep Tissue, learn which massage technique is right for your needs.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Choosing the right massage technique can make all the difference in your experience and results. Here\'s a guide to help you understand the most popular options.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Swedish Massage' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'The most common type of massage, Swedish massage uses long, flowing strokes to promote relaxation and improve circulation. Perfect for first-time massage clients, general relaxation, and improving circulation.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Deep Tissue Massage' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'This technique uses slower, more forceful strokes to target deeper layers of muscle and connective tissue. Best for chronic muscle tension, recovery from injuries, and persistent pain relief.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Hot Stone Massage' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Heated basalt stones are placed on key points of the body and used during the massage. Benefits include deep muscle relaxation, improved blood flow, and enhanced stress relief.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Sports Massage' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Designed for athletes and active individuals, sports massage focuses on preventing and treating injuries. Ideal for pre and post-workout recovery, injury prevention, and performance enhancement.' }],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      category: 'education' as const,
      author: 'Free The Wellness',
      status: 'published' as const,
      publishedAt: '2024-11-15T00:00:00.000Z',
      tags: [{ tag: 'massage techniques' }, { tag: 'education' }],
    },
    {
      title: 'Self-Care Tips Between Massage Sessions',
      slug: 'self-care-tips-between-sessions',
      excerpt: 'Maximize the benefits of your massage therapy with these simple at-home self-care practices.',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'While regular professional massage is essential, what you do between sessions matters too. Here are practical ways to maintain your wellness and extend the benefits of your treatments.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Stay Hydrated' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Drinking plenty of water after a massage helps flush out toxins released during treatment. Aim for at least 8 glasses of water daily, and even more on treatment days.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Stretch Daily' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Gentle stretching helps maintain the flexibility gained during massage. Focus on areas that tend to get tight, like your neck, shoulders, and lower back.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Practice Good Posture' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Be mindful of your posture throughout the day, especially if you work at a desk. Regular posture checks can prevent the tension that builds up between sessions.' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Get Enough Sleep' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Quality sleep is when your body does its deepest healing. Aim for 7-9 hours per night and establish a consistent sleep schedule.' }],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      category: 'self-care' as const,
      author: 'Free The Wellness',
      status: 'published' as const,
      publishedAt: '2024-11-01T00:00:00.000Z',
      tags: [{ tag: 'self-care' }, { tag: 'tips' }],
    },
  ]

  for (const post of blogPostsData) {
    await payload.create({
      collection: 'cms-posts',
      data: post,
    })
    console.log(`  Created blog post: ${post.title}`)
  }

  console.log('✅ Seeding complete!')
  process.exit(0)
}

seed().catch((e) => {
  console.error('Seeding failed:', e)
  process.exit(1)
})
