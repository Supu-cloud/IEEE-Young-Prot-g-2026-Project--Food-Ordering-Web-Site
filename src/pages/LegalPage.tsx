import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

const pages = {
  terms: {
    label: 'Terms of Service',
    title: 'A simple promise between Foodie and you',
    intro: 'These sample terms explain the basics of ordering local food through Foodie.',
    sections: [
      ['Ordering with care', 'You can browse menus, place orders, and receive updates from restaurants and delivery partners listed on Foodie. Please check your order details before confirming.'],
      ['Payments and changes', 'Prices and availability are confirmed at checkout. If a restaurant cannot fulfil an order, we will let you know and help resolve the order promptly.'],
      ['Your account', 'Keep your account details accurate and your sign-in information private. Foodie may pause accounts that are used fraudulently or to disrupt the service.'],
    ],
  },
  privacy: {
    label: 'Privacy Policy',
    title: 'Your information, handled thoughtfully',
    intro: 'This sample policy describes the information Foodie uses to make ordering faster and safer.',
    sections: [
      ['What we use', 'We use your contact, delivery, and order information to process purchases, provide support, and keep you informed about an order.'],
      ['What we share', 'We share only the details needed with the restaurant and delivery partner handling your order. We do not sell your personal information.'],
      ['Your choices', 'You can ask about the information associated with your account or request an update through Foodie support. We keep information only as long as it is useful for these purposes.'],
    ],
  },
  cookies: {
    label: 'Cookie Policy',
    title: 'Small files that keep Foodie useful',
    intro: 'Cookies help us remember preferences, keep accounts secure, and understand which parts of the website need improvement.',
    sections: [
      ['Essential cookies', 'These support sign-in, checkout, cart state, and security features. The website may not work correctly if they are disabled.'],
      ['Preference cookies', 'These remember choices such as your preferred experience so you do not need to repeat them on every visit.'],
      ['Managing cookies', 'You can manage cookies through your browser settings. Blocking optional cookies may change how some Foodie features behave.'],
    ],
  },
} as const

export function LegalPage() {
  const { topic = 'terms' } = useParams()
  const page = pages[topic as keyof typeof pages] ?? pages.terms

  return <main className="page legal-page"><div className="container"><Link className="back-link" to="/"><ArrowLeft /> Back to Foodie</Link><article className="legal-panel"><div className="legal-panel__intro"><span className="legal-icon"><ShieldCheck /></span><span className="eyebrow">Foodie policy centre</span><h1>{page.title}</h1><p>{page.intro}</p><small>Last updated September 2026 - Sample customer policy</small></div><div className="legal-sections">{page.sections.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}</div></article></div></main>
}