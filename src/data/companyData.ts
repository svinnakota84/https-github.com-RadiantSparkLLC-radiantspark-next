/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DivisionInfo, ServicePractice } from '../types';

export const INDIA_DIVISIONS: DivisionInfo[] = [
  {
    id: 'spark-ev',
    name: 'Spark EV',
    tagline: 'Clean Energy & Electric Mobility Infrastructure',
    category: 'Clean Energy',
    description: 'Solar power solutions, EV charging infrastructure planning, commercial installation coordination, and battery-ready microgrid concepts across Andhra Pradesh and South India.',
    features: [
      'Commercial & Residential Solar Rooftop Planning',
      'EV Charging Station Site Deployment & Grid Interconnect',
      'LiFePO4 Storage Systems & Backup Integration',
      'Regional Clean Energy Transition Roadmaps'
    ],
    image: './assets/spark-ev.jpg',
    linkText: 'Explore Spark EV Initiatives'
  },
  {
    id: 'sparkle-drinks',
    name: 'Sparkle Drinks',
    tagline: 'Contemporary Refreshment & Botanical Beverages',
    category: 'Beverages',
    description: 'Beverage product formulation, contract manufacturing partnerships, wholesale supply distribution, and market expansion subject to applicable food-safety approvals and sustainable packaging.',
    features: [
      'Zero Refined Sugar Botanical Spritzes & Hydration',
      'Licensing and applicable product standards require verification',
      'B2B Wholesale & Modern Trade Distribution',
      'Eco-Friendly Recyclable Aluminum Can Packaging'
    ],
    image: './assets/sparkle-drinks.jpg',
    linkText: 'Discover Sparkle Drinks'
  },
  {
    id: 'spicy-sparkle-naturals',
    name: 'Spicy Sparkle Naturals',
    tagline: 'Artisanal Natural Foods & Dry Fruit Provisions',
    category: 'Food & Wellness',
    description: 'Premium natural snacks, dry-fruit provisions, and ethically sourced spices celebrating Andhra Pradesh’s rich culinary agricultural heritage with uncompromised quality.',
    features: [
      'W240 Jumbo Cashews & California Nonpareil Almonds',
      'Authentic Guntur Sun-Dried Chili & Turmeric Extracts',
      'Zero Palm Oil, Cold-Pressed Roasting Technique',
      'Multi-Tier Vacuum Sealed Freshness Packaging'
    ],
    image: './assets/spicy-sparkle-naturals.jpg',
    linkText: 'Browse Naturals Range'
  },
  {
    id: 'sparkle-distribution',
    name: 'Sparkle Distribution Network',
    tagline: 'Regional Supply Chain & Sustainable Last-Mile Logistics',
    category: 'Distribution & Fleet',
    description: 'In-house regional supply-chain operations supporting Sparkle Drinks, local FMCG cargo, regional merchant logistics, and pilot solar-assisted shared delivery fleets in Andhra Pradesh.',
    features: [
      'Intra-City Delivery Corridors (Guntur, Vijayawada, Vizag)',
      'Temperature-Controlled Transit for Beverage & Food Lines',
      'Smart Route Optimization & GPS Fleet Telematics',
      'Pilot Solar Charging Depot Integration'
    ],
    image: './assets/sparkle-distribution.jpg',
    linkText: 'Learn About Distribution'
  }
];

export const USA_SERVICES: ServicePractice[] = [
  {
    number: '01',
    badge: 'TRANSFORMATION',
    title: 'Business Transformation',
    description: 'Enterprise process re-engineering, workflow modernization, and governance redesign to accelerate cross-functional operational velocity and efficiency.',
    technologies: ['BPMN 2.0', 'Process Mining', 'Change Management', 'Value Stream Mapping']
  },
  {
    number: '02',
    badge: 'MODERNIZATION',
    title: 'Digital & Cloud Modernization',
    description: 'Cloud-first re-architecting, multi-cloud strategy, infrastructure as code, and containerized microservices to replace legacy mainframe bottlenecks.',
    technologies: ['AWS', 'Google Cloud', 'Terraform', 'Kubernetes', 'Docker']
  },
  {
    number: '03',
    badge: 'INTELLIGENCE',
    title: 'Artificial Intelligence & ML',
    description: 'Pragmatic enterprise AI strategy, custom LLM fine-tuning, retrieval-augmented generation (RAG), automated document intelligence, and AI governance.',
    technologies: ['Gemini 2.5/Flash', 'PyTorch', 'Vector Databases', 'LangChain', 'Enterprise RAG']
  },
  {
    number: '04',
    badge: 'PLATFORMS',
    title: 'Technology & Systems Integration',
    description: 'Robust API middleware architecture, enterprise service bus (ESB) retirement, secure webhook pipelines, and real-time event brokers.',
    technologies: ['REST / GraphQL', 'Apache Kafka', 'MuleSoft', 'gRPC', 'Event-Driven Architectures']
  },
  {
    number: '05',
    badge: 'ENGINEERING',
    title: 'Custom Software & Platforms',
    description: 'Bespoke web applications, high-performance distributed backends, internal operations dashboards, and SaaS platforms tailored to bespoke business rules.',
    technologies: ['React', 'TypeScript', 'Node.js / Express', 'PostgreSQL', 'Tailwind CSS']
  },
  {
    number: '06',
    badge: 'ADVISORY & HCM',
    title: 'Oracle Cloud & Technology Staffing',
    description: 'Deep specialized advisory in Oracle Fusion HCM, fast formulas, SQL troubleshooting, BIP reports, data migrations, alongside elite technology staffing.',
    technologies: ['Oracle Fusion HCM', 'Oracle Cloud ERP', 'SQL Performance Tuning', 'BI Publisher']
  }
];
