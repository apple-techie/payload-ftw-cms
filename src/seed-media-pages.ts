// Seed script for uploading blog images and creating pages
// Run: npx tsx src/seed-media-pages.ts

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

async function uploadMediaFromUrl(
  imageUrl: string,
  alt: string,
  filename: string,
  token: string
): Promise<number> {
  // Fetch the image
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageUrl}`)
  }

  const imageBlob = await imageResponse.blob()

  // Create form data for upload
  const formData = new FormData()
  formData.append('file', imageBlob, filename)
  formData.append('alt', alt)

  const response = await fetch(`${CMS_URL}/api/media`, {
    method: 'POST',
    headers: {
      Authorization: `JWT ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload media: ${error}`)
  }

  const result = await response.json()
  return result.doc.id
}

async function updateBlogPostImageUrl(postId: number, imageUrl: string, token: string) {
  const response = await fetch(`${CMS_URL}/api/cms-posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({ coverImageUrl: imageUrl }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update blog post: ${error}`)
  }

  return response.json()
}

async function createPage(data: Record<string, unknown>, token: string) {
  const response = await fetch(`${CMS_URL}/api/pages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create page: ${error}`)
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

  console.log('Seeding media and pages...')
  console.log(`Using CMS at: ${CMS_URL}`)

  // Login
  console.log('Logging in...')
  const token = await login(email, password)
  console.log('Logged in')

  // Blog images to upload
  const blogImages = [
    {
      url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      alt: 'Woman receiving relaxing massage therapy',
      filename: 'massage-benefits.jpg',
      blogSlug: '5-benefits-regular-massage-therapy',
    },
    {
      url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80',
      alt: 'Professional massage therapist performing deep tissue massage',
      filename: 'massage-techniques.jpg',
      blogSlug: 'understanding-massage-techniques',
    },
    {
      url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80',
      alt: 'Self-care wellness products and relaxation setup',
      filename: 'self-care-tips.jpg',
      blogSlug: 'self-care-tips-between-sessions',
    },
  ]

  // Get existing blog posts
  console.log('Fetching blog posts...')
  const postsResponse = await fetch(`${CMS_URL}/api/cms-posts`)
  const postsData = await postsResponse.json()
  const posts = postsData.docs as Array<{ id: number; slug: string; title: string }>

  // Set external image URLs on blog posts
  console.log('Setting blog cover image URLs...')
  for (const image of blogImages) {
    const post = posts.find((p) => p.slug === image.blogSlug)
    if (!post) {
      console.log(`  Skipped: No post found with slug ${image.blogSlug}`)
      continue
    }

    try {
      console.log(`  Setting cover image URL for "${post.title}"...`)
      await updateBlogPostImageUrl(post.id, image.url, token)
      console.log(`  Set cover image URL`)
    } catch (e) {
      console.log(`  Failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  // Seed Pages
  console.log('Seeding pages...')
  const pagesData = [
    {
      title: 'About Us',
      slug: 'about',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Our Story' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Free The Wellness was founded with a simple mission: to make quality massage therapy accessible to everyone. We believe that wellness should not be a luxury, but a regular part of life.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Our Approach' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'We combine traditional massage techniques with modern wellness practices to provide personalized treatments that address your unique needs. Our therapists are highly trained professionals dedicated to your well-being.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Our Values' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Quality, accessibility, and personalized care are at the heart of everything we do. We are committed to creating a welcoming environment where you can relax, heal, and thrive.',
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
      meta: {
        description:
          'Learn about Free The Wellness - our mission to make quality massage therapy accessible to everyone.',
      },
      status: 'published',
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: "We'd love to hear from you! Whether you have questions about our services, want to book an appointment, or just want to say hello, we're here to help.",
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Get in Touch' }],
            },
            {
              type: 'paragraph',
              children: [
                { type: 'text', text: 'Email: hello@freethewellness.com' },
              ],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Phone: (555) 123-4567' }],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Hours of Operation' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Monday - Friday: 9am - 8pm\nSaturday: 10am - 6pm\nSunday: 11am - 5pm',
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
      meta: {
        description: 'Contact Free The Wellness for bookings, questions, or inquiries.',
      },
      status: 'published',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Last updated: December 2024',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Information We Collect' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'We collect information you provide directly to us, such as when you create an account, book an appointment, or contact us. This may include your name, email address, phone number, and health-related information relevant to your treatment.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'How We Use Your Information' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send appointment reminders, and communicate with you about our services.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Data Security' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'We implement appropriate security measures to protect your personal information. Your health information is kept confidential in accordance with applicable laws and regulations.',
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
      meta: {
        description: 'Free The Wellness privacy policy - how we collect, use, and protect your data.',
      },
      status: 'published',
    },
    {
      title: 'Terms of Service',
      slug: 'terms',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Last updated: December 2024',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Booking and Cancellation Policy' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Appointments can be booked online or by phone. We require 24-hour notice for cancellations. Late cancellations or no-shows may be subject to a cancellation fee.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Payment Terms' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Payment is due at the time of service. We accept major credit cards and wellness packages. Package credits are non-refundable but are transferable.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Health Disclaimer' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Massage therapy is not a substitute for medical treatment. Please consult your healthcare provider if you have any medical conditions or concerns before receiving massage therapy.',
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
      meta: {
        description: 'Free The Wellness terms of service - booking, payment, and policies.',
      },
      status: 'published',
    },
    {
      title: 'Frequently Asked Questions',
      slug: 'faq',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'What should I expect during my first visit?' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: "During your first visit, you'll complete a brief intake form about your health history and goals. Your therapist will discuss your needs and customize your treatment accordingly.",
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'How often should I get a massage?' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'This depends on your individual needs. For general wellness, once a month is a great starting point. For chronic pain or athletic recovery, more frequent sessions may be beneficial.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'What are wellness credits?' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Wellness credits are prepaid packages that can be used for any of our services. They offer savings compared to individual session pricing and never expire.',
                },
              ],
            },
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Can I bring a friend or partner?' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'We offer couples and duo sessions where you can enjoy treatments side by side in the same room. Contact us to book a couples session.',
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
      meta: {
        description: 'Frequently asked questions about Free The Wellness services and policies.',
      },
      status: 'published',
    },
  ]

  for (const page of pagesData) {
    try {
      await createPage(page, token)
      console.log(`  Created page: ${page.title}`)
    } catch (e) {
      console.log(`  Skipped page: ${page.title} (may already exist)`)
    }
  }

  console.log('Seeding complete!')
}

seed().catch((e) => {
  console.error('Seeding failed:', e)
  process.exit(1)
})
