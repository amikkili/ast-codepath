// lib/constants.js  ← REPLACE existing file
// UPDATED: Added full address, CEO details, contact hours

export const COMPANY = {
  name:     'Anil Software Technologies',
  short:    'AST',
  product:  'CodePath',
  ceo:      'Anil Kumar Mikkili',
  role:     'CEO & Founder',
  exp:      '13+ years in Integration, Cloud & AI/ML',
  email:    'contact@anilsofttech.com',
  phone:    '+91 9866376367',
  hours:    'Mon – Fri, 10 AM – 6 PM IST',
  address:  'Ponnur, Guntur (DT), Andhra Pradesh, India — 522124',
  website:  'www.anilsofttech.com',
  tagline:  'Learn programming with an AI tutor by your side',
}

export const PLAN_ORDER = { FREE: 0, BASIC: 1, PRO: 2 }

export function canAccess(userPlan, requiredPlan) {
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[requiredPlan]
}

export const PLANS = [
  {
    id: 'FREE', name: 'Free', price: 0, per: 'forever',
    desc: 'Try before you commit.',
    features: [
      { text: '2 free preview lessons',        ok: true  },
      { text: 'Limited AI agent (5/day)',       ok: true  },
      { text: 'All video lessons',              ok: false },
      { text: 'Completion certificate',         ok: false },
      { text: 'Live weekly sessions',           ok: false },
    ],
    cta: 'Get started free', popular: false,
  },
  {
    id: 'BASIC', name: 'Basic', price: 12, per: '/ month',
    desc: 'Full course access + unlimited AI.',
    features: [
      { text: 'All courses & lessons',          ok: true  },
      { text: 'Unlimited AI doubt agent',       ok: true  },
      { text: 'In-browser progress tracking',  ok: true  },
      { text: 'Completion certificate',         ok: true  },
      { text: 'Live weekly sessions',           ok: false },
    ],
    cta: 'Subscribe — $12/mo', popular: true,
  },
  {
    id: 'PRO', name: 'Pro', price: 39, per: '/ month',
    desc: 'Everything in Basic + live classes.',
    features: [
      { text: 'Everything in Basic',            ok: true  },
      { text: 'Weekly live sessions',           ok: true  },
      { text: '1:1 mentor office hours',        ok: true  },
      { text: 'Priority AI support',            ok: true  },
      { text: 'Job prep & interview kit',       ok: true  },
    ],
    cta: 'Subscribe — $39/mo', popular: false,
  },
]
